const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const { encrypt } = require('../utils/encryption');

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
            user = await User.create(db, { email, password });
            res.status(201).json({ message: 'User registered successfully' });
        } catch (err) {
            res.status(500).json({ message: 'Server error' });
        }
    });

    // Login
    router.post('/login', (req, res, next) => {
        passport.authenticate('local', { session: false }, async (err, user, info) => {
            if (err) return next(err);
            if (!user) return res.status(400).json({ message: info.message });

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

    return router;
};
