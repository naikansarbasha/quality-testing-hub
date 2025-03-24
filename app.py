from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from dotenv import load_dotenv
import requests
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='.')
CORS(app, origins=["http://localhost:8000", "http://127.0.0.1:8000",
     "http://localhost:5000"], supports_credentials=True)

# Resend API configuration
RESEND_API_KEY = os.getenv('RESEND_API_KEY')
RECIPIENT_EMAIL = "contact@qasecurelabs.com"

logger.info(
    f"Loaded API Key (first 4 chars): {RESEND_API_KEY[:4] if RESEND_API_KEY else 'None'}")
logger.info(f"Recipient Email: {RECIPIENT_EMAIL}")


@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')


@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)


@app.route('/send-email', methods=['POST'])
def send_email():
    try:
        logger.info("Received email request")
        data = request.json
        logger.debug(f"Request data: {data}")

        name = data.get('name', 'Anonymous')
        email = data.get('email')
        subject = data.get('subject', 'Contact Form Submission')
        message = data.get('message')

        if not email or not message:
            logger.warning("Missing required fields")
            return jsonify({"error": "Email and message are required"}), 400

        # Create email content
        email_body = f"""
        New contact form submission from QA Secure Labs website:

        Name: {name}
        Email: {email}
        Subject: {subject}
        Message: {message}
        """

        # Log email data
        logger.info(f"Sending email to: {RECIPIENT_EMAIL}")
        logger.info(f"From: QA Secure Labs <onboarding@resend.dev>")
        logger.info(f"Subject: New Contact Form Submission: {subject}")

        # Send email via Resend API
        headers = {
            'Authorization': f'Bearer {RESEND_API_KEY}',
            'Content-Type': 'application/json'
        }

        payload = {
            'from': 'QA Secure Labs <onboarding@resend.dev>',
            'to': RECIPIENT_EMAIL,
            'subject': f'New Contact Form Submission: {subject}',
            'text': email_body
        }

        logger.debug("Making request to Resend API")
        response = requests.post(
            'https://api.resend.com/emails',
            headers=headers,
            json=payload
        )

        logger.info(f"Resend API Response: Status {response.status_code}")
        logger.debug(f"Response body: {response.text}")

        if response.status_code == 200:
            logger.info("Email sent successfully")
            return jsonify({"message": "Email sent successfully"}), 200
        else:
            logger.error(f"Error sending email: {response.text}")
            return jsonify({"error": f"Error sending email: {response.text}"}), 500

    except Exception as e:
        logger.exception("Exception during email sending")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
