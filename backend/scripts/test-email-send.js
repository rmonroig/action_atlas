const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('--- Email Sending Test ---');

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;
const service = process.env.EMAIL_SERVICE;

if (!user || !pass) {
    console.error('ERROR: EMAIL_USER or EMAIL_PASS is missing.');
    process.exit(1);
}

const isZoho = service === 'Zoho';
const host = isZoho ? 'smtp.zoho.eu' : 'smtp.gmail.com';

const transporter = nodemailer.createTransport({
    host: host,
    port: 587,
    secure: false,
    auth: {
        user: user,
        pass: pass
    }
});

async function sendTest() {
    try {
        console.log(`Attempting to send email from ${user} to ${user}...`);
        const info = await transporter.sendMail({
            from: user,
            to: 'rafaelmonroigvives@gmail.com', // User requested test email
            subject: 'Brave Mentor Diagnostic Test',
            text: 'If you see this, email sending is working correctly. Sent to rafaelmonroigvives@gmail.com.'
        });
        console.log('Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('Email Sending Failed:', error.message);
        if (error.response) console.error('SMTP Response:', error.response);
    }
}

sendTest();
