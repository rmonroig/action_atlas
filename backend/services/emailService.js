const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
    if (!transporter) {
        const isZoho = process.env.EMAIL_SERVICE === 'Zoho';
        console.log(`[EmailService] Initializing transporter. Service: ${isZoho ? 'Zoho' : 'Gmail'}`);
        transporter = nodemailer.createTransport({
            host: isZoho ? 'smtp.zoho.eu' : 'smtp.gmail.com',
            port: 587,
            secure: false, // STARTTLS
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    return transporter;
};

const sendVerificationEmail = async (email, token) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('--- EMAIL SIMULATION ---');
        console.log(`To: ${email}`);
        console.log(`Subject: Verify your email`);
        console.log(`Link: ${verificationLink}`);
        console.log('--- END SIMULATION ---');
        return;
    }

    try {
        const isZoho = process.env.EMAIL_SERVICE === 'Zoho';
        console.log(`[EmailService] Attempting to send verification email to: ${email}`);

        const info = await getTransporter().sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Brave Mentor - Verify your email',
            html: `
                <h3>Welcome to Brave Mentor!</h3>
                <p>Please click the link below to verify your email address:</p>
                <a href="${verificationLink}">${verificationLink}</a>
                <p>If you didn't request this, please ignore this email.</p>
            `
        });
        console.log(`[EmailService] SUCCESS: Email sent to ${email}. Message ID: ${info.messageId}`);
    } catch (error) {
        console.error('[EmailService] ERROR: Failed to send email.');
        // Force re-initialization on next attempt if auth failed, in case env vars changed or transient issue
        if (error.response && error.response.includes('Authentication')) {
            transporter = null;
        }

        console.error(`[EmailService] Error Code: ${error.code}`);
        console.error(`[EmailService] Error Message: ${error.message}`);
        if (error.response) {
            console.error(`[EmailService] SMTP Response: ${error.response}`);
        }
        throw error;
    }
};

module.exports = { sendVerificationEmail };
