require('dotenv').config();
console.log('--- DEBUG ENV ---');
console.log('CWD:', process.cwd());
console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Missing');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Missing');

try {
    const { sendVerificationEmail } = require('./services/emailService');
    console.log('Email Service Loaded Successfully');
} catch (e) {
    console.error('Failed to load email service:', e);
}
