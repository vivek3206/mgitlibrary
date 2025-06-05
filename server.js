const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
const HOST = process.env.HOST || '0.0.0.0';  // Listen on all network interfaces
const PORT = process.env.PORT || 8080;        // Use 8080 as default port

// Security middleware
app.use(cors({
    origin: '*',  // In production, replace with specific origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Enable trust proxy if behind a reverse proxy
app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files with proper MIME types
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// Basic security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Database setup
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roll_number TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        category TEXT NOT NULL,
        cover_url TEXT,
        pdf_url TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS reset_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roll_number TEXT NOT NULL,
        token TEXT NOT NULL,
        expires_at DATETIME NOT NULL
    )`);
}

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Routes

// Sign up
app.post('/api/signup', async (req, res) => {
    res.status(404).json({ error: 'Route removed' });
});

// Sign in
app.post('/api/signin', (req, res) => {
    res.status(404).json({ error: 'Route removed' });
});

// Password reset request
app.post('/api/reset-password-request', (req, res) => {
    const { roll_number, email } = req.body;

    db.get('SELECT * FROM users WHERE roll_number = ? AND email = ?', [roll_number, email], (err, user) => {
        if (err || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const resetToken = Math.random().toString(36).slice(-6).toUpperCase();
        const expiresAt = new Date(Date.now() + 30 * 60000); // 30 minutes

        db.run('INSERT INTO reset_tokens (roll_number, token, expires_at) VALUES (?, ?, ?)',
            [roll_number, resetToken, expiresAt.toISOString()],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Error generating reset token' });
                }

                // Send email
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: 'Password Reset Code - MGIT Knowledge Navigator',
                    text: `Your password reset code is: ${resetToken}\nThis code will expire in 30 minutes.`
                };

                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error sending email' });
                    }
                    res.json({ message: 'Reset code sent successfully' });
                });
            });
    });
});

// Verify reset token and set new password
app.post('/api/reset-password', async (req, res) => {
    const { roll_number, token, new_password } = req.body;

    db.get('SELECT * FROM reset_tokens WHERE roll_number = ? AND token = ? AND expires_at > datetime("now")',
        [roll_number, token],
        async (err, resetToken) => {
            if (err || !resetToken) {
                return res.status(400).json({ error: 'Invalid or expired reset code' });
            }

            const hashedPassword = await bcrypt.hash(new_password, 10);

            db.run('UPDATE users SET password = ? WHERE roll_number = ?',
                [hashedPassword, roll_number],
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: 'Error updating password' });
                    }

                    // Delete used token
                    db.run('DELETE FROM reset_tokens WHERE roll_number = ?', [roll_number]);

                    res.json({ message: 'Password updated successfully' });
                });
        });
});

// Get books by category
app.get('/api/books', (req, res) => {
    db.all('SELECT * FROM books', [], (err, books) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching books' });
        }
        res.json(books);
    });
});

app.get('/api/books/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM books WHERE id = ?', [id], (err, book) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching book' });
        }
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json(book);
    });
});

// Handle SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server with error handling
const server = app.listen(PORT, HOST, (err) => {
    if (err) {
        console.error('Error starting server:', err);
        process.exit(1);
    }
    console.log(`Server running on http://${HOST}:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        db.close(() => {
            console.log('Database connection closed');
            process.exit(0);
        });
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
}); 