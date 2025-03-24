const express = require('express');
const cors = require('cors');
const path = require('path');
const { Resend } = require('resend');
require('dotenv').config();

const app = express();

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// Contact form endpoint
app.post('/send-email', async (req, res) => {
    const { email, subject, message } = req.body;
    
    try {
        // Send email to admin
        await resend.emails.send({
            from: 'QA Secure Labs <contact@qasecurelabs.com>',
            to: ['contact@qasecurelabs.com'],
            subject: `New Contact Form Submission: ${subject}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>From:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `
        });

        // Send confirmation email to user
        await resend.emails.send({
            from: 'QA Secure Labs <contact@qasecurelabs.com>',
            to: [email],
            subject: 'Thank you for contacting QA Secure Labs',
            html: `
                <h2>Thank you for contacting QA Secure Labs!</h2>
                <p>We have received your message and will get back to you shortly.</p>
                <p>Best regards,<br>QA Secure Labs Team</p>
            `
        });

        res.json({ message: 'Emails sent successfully' });
    } catch (error) {
        console.error('Error sending emails:', error);
        res.status(500).json({ error: 'Failed to send emails' });
    }
});

// Start server
const PORT = 8080;
const server = app.listen(PORT, '0.0.0.0', (err) => {
    if (err) {
        console.error('Error starting server:', err);
        return;
    }
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Test the server at http://localhost:${PORT}/test`);
});

// Handle server errors
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please try a different port.`);
    } else {
        console.error('Server error:', err);
    }
});