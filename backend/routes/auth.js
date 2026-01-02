const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const { encrypt } = require('../utils/encryption');

const crypto = require('crypto');
const { sendVerificationEmail } = require('../services/emailService');

module.exports = function (db) {
    const loginLogCollection = db.collection('user_login');

    // Register
    router.post('/register', async (req, res) => {
        const { email, password } = req.body;
        try {
            let user = await User.findByEmail(db, email);
            if (user) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const verificationToken = crypto.randomBytes(32).toString('hex');

            user = await User.create(db, {
                email,
                password,
                isVerified: false,
                verificationToken
            });

            // Send verification email
            // console.log('[AuthDebug] Registering user:', email);
            // console.log('[AuthDebug] EMAIL_USER present:', !!process.env.EMAIL_USER);
            // console.log('[AuthDebug] EMAIL_PASS present:', !!process.env.EMAIL_PASS);
            // console.log('[AuthDebug] EMAIL_SERVICE:', process.env.EMAIL_SERVICE);

            try {
                console.log('[AuthDebug] Calling sendVerificationEmail...');
                await sendVerificationEmail(email, verificationToken);
                console.log('[AuthDebug] sendVerificationEmail completed.');
            } catch (emailErr) {
                console.error('[AuthDebug] Failed to send verification email:', emailErr);
                // We typically still allow registration but log the error
            }

            res.status(201).json({ message: 'User registered. CHECK EMAIL NOW.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // Verify Email Endpoint
    router.post('/verify-email', async (req, res) => {
        const { token } = req.body;
        try {
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
    });

    // Login
    router.post('/login', (req, res, next) => {
        passport.authenticate('local', { session: false }, async (err, user, info) => {
            if (err) return next(err);
            if (!user) return res.status(400).json({ message: info.message });

            // Check verification
            if (user.isVerified === false) {
                return res.status(403).json({ message: 'Please verify your email address before logging in.' });
            }

            const payload = { id: user._id, email: user.email };
            const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

            // Record login with encrypted token
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
    });

    // Google Auth
    router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

    // Google Auth Callback
    router.get('/google/callback',
        passport.authenticate('google', { session: false, failureRedirect: '/login' }),
        async (req, res) => {
            const payload = { id: req.user._id, email: req.user.email };
            const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

            // Record login with encrypted token
            try {
                const encryptedToken = encrypt(token);
                await loginLogCollection.insertOne({
                    userEmail: req.user.email,
                    encryptedToken,
                    timestamp: new Date()
                });
            } catch (loggingError) {
                console.error('Failed to log google login:', loggingError);
            }

            // Redirect to frontend with token
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth-success?token=${token}`);
        }
    );

    // Logout
    router.post('/logout', (req, res) => {
        res.json({ message: 'Logged out successfully' });
    });

    // Get User Profile
    router.get('/me', async (req, res) => {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            jwt.verify(token, process.env.JWT_SECRET || 'secret', async (err, user) => {
                if (err) {
                    return res.sendStatus(403);
                }

                try {
                    // Fetch fresh user data from DB
                    const userData = await User.findByEmail(db, user.email);
                    if (!userData) {
                        return res.status(404).json({ message: 'User not found' });
                    }
                    res.json({
                        email: userData.email,
                        // Add other fields here if they exist in your User schema
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
    });

    return router;
};
