from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
from urllib.parse import parse_qs
import sys
import os
from resend import Resend
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Resend client
resend = Resend(api_key=os.getenv('RESEND_API_KEY'))


class CustomHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/send-email':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            email = data.get('email')
            subject = data.get('subject')
            message = data.get('message')

            try:
                # Send email to admin
                admin_response = resend.emails.send({
                    "from": "QA Secure Labs <contact@qasecurelabs.com>",
                    "to": ["contact@qasecurelabs.com"],
                    "subject": f"New Contact Form Submission: {subject}",
                    "html": f"""
                        <h2>New Contact Form Submission</h2>
                        <p><strong>From:</strong> {email}</p>
                        <p><strong>Subject:</strong> {subject}</p>
                        <p><strong>Message:</strong></p>
                        <p>{message}</p>
                    """
                })

                # Send confirmation email to user
                user_response = resend.emails.send({
                    "from": "QA Secure Labs <contact@qasecurelabs.com>",
                    "to": [email],
                    "subject": "Thank you for contacting QA Secure Labs",
                    "html": """
                        <h2>Thank you for contacting QA Secure Labs!</h2>
                        <p>We have received your message and will get back to you shortly.</p>
                        <p>Best regards,<br>QA Secure Labs Team</p>
                    """
                })

                # Send success response
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header(
                    'Access-Control-Allow-Methods', 'POST, OPTIONS')
                self.send_header(
                    'Access-Control-Allow-Headers', 'Content-Type')
                self.end_headers()

                response = {'message': 'Emails sent successfully'}
                self.wfile.write(json.dumps(response).encode('utf-8'))

            except Exception as e:
                print(f"Error sending emails: {str(e)}")
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response = {'error': 'Failed to send emails'}
                self.wfile.write(json.dumps(response).encode('utf-8'))
        else:
            super().do_POST()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()


def run(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, CustomHandler)
    print(f"Server running on http://localhost:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()
        sys.exit(0)


if __name__ == '__main__':
    run()
