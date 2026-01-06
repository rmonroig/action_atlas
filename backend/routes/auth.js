const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');

// Register
router.post('/register', authController.register);

// Verify Email
router.post('/verify-email', authController.verifyEmail);

// Login
router.post('/login', authController.login);

// Logout
router.post('/logout', authController.logout);

// Get Current User
router.get('/me', authController.getCurrentUser);

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google Callback
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    authController.googleCallback
);

// We export a function that returns the router, to maintain signature compatibility 
// with server.js which calls `require('./routes/auth')(db)`.
// Although we don't need `db` anymore as controller gets it.
module.exports = function (db) {
    return router;
};
