const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('--- Email Config Diagnostic ---');

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;
const service = process.env.EMAIL_SERVICE;

console.log(`EMAIL_SERVICE: ${service}`);
console.log(`EMAIL_USER Present: ${!!user}`);
console.log(`EMAIL_PASS Present: ${!!pass}`);

if (!user || !pass) {
    console.error('ERROR: EMAIL_USER or EMAIL_PASS is missing from environment variables.');
    process.exit(1);
}

const isZoho = service === 'Zoho';
const host = isZoho ? 'smtp.zoho.eu' : 'smtp.gmail.com';

console.log(`Using Host: ${host}`);

const transporter = nodemailer.createTransport({
    host: host,
    port: 587,
    secure: false,
    auth: {
        user: user,
        pass: pass
    }
});

async function verify() {
    try {
        console.log('Verifying SMTP connection...');
        await transporter.verify();
        console.log('SMTP Connection Successful!');
    } catch (error) {
        console.error('SMTP Connection Failed:', error.message);
        if (error.response) console.error('SMTP Response:', error.response);
    }
}

verify();
