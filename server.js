const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

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
app.post('/send-email', (req, res) => {
    const { email, subject, message } = req.body;
    console.log('Received form submission:', { email, subject, message });
    res.json({ message: 'Form submitted successfully' });
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