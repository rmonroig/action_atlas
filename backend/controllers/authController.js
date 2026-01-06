const passport = require('passport');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail } = require('../services/emailService');
const { getAuthDb } = require('../config/db');
const { encrypt } = require('../utils/encryption');

// Register
exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = getAuthDb();

        let user = await User.findByEmail(db, email);
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');

        await User.create(db, {
            email,
            password,
            isVerified: false,
            verificationToken
        });

        try {
            await sendVerificationEmail(email, verificationToken);
        } catch (emailErr) {
            console.error('[Auth] Failed to send verification email:', emailErr);
        }

        res.status(201).json({ message: 'User registered. CHECK EMAIL NOW.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
    const { token } = req.body;
    try {
        const db = getAuthDb();
        const user = await User.findByVerificationToken(db, token);
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        await User.verifyUser(db, user._id);
        res.json({ message: 'Email verified successfully. You can now login.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Login
exports.login = (req, res, next) => {
    const db = getAuthDb(); // Passport local strategy usually handles finding user, but we need db for logging
    const loginLogCollection = db.collection('user_login');

    passport.authenticate('local', { session: false }, async (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(400).json({ message: info ? info.message : 'Login failed' });

        if (user.isVerified === false) {
            return res.status(403).json({ message: 'Please verify your email address before logging in.' });
        }

        const payload = { id: user._id, email: user.email };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

        // Record login
        try {
            const encryptedToken = encrypt(token);
            await loginLogCollection.insertOne({
                userEmail: user.email,
                encryptedToken,
                timestamp: new Date()
            });
        } catch (loggingError) {
            console.error('Failed to log login:', loggingError);
        }

        res.json({ token, user: { email: user.email } });
    })(req, res, next);
};

// Google Callback
exports.googleCallback = (req, res) => {
    // req.user is populated by passport
    const user = req.user;
    const payload = { id: user._id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    // We could log this login too if we wanted, similar to local login
    // For now matching original behavior which logged it inside the route handler
    // We can't easily access DB here without connection, but we can try:
    try {
        const db = getAuthDb();
        const loginLogCollection = db.collection('user_login');
        const encryptedToken = encrypt(token);

        loginLogCollection.insertOne({
            userEmail: user.email,
            encryptedToken,
            timestamp: new Date()
        }).catch(err => console.error('Failed to log google login:', err));
    } catch (e) { console.error(e); }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/success?token=${token}`);
};

// Logout
exports.logout = (req, res) => {
    res.json({ message: 'Logged out successfully' });
};

// Get Current User
exports.getCurrentUser = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET || 'secret', async (err, decoded) => {
            if (err) return res.sendStatus(403);

            try {
                const db = getAuthDb();
                const userData = await User.findByEmail(db, decoded.email);
                if (!userData) return res.status(404).json({ message: 'User not found' });

                res.json({
                    email: userData.email,
                    id: userData._id
                });
            } catch (e) {
                console.error("Error fetching user profile:", e);
                res.status(500).json({ message: 'Server error' });
            }
        });
    } else {
        res.sendStatus(401);
    }
};
