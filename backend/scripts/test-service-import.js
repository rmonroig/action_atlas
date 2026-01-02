require('dotenv').config();
const { sendVerificationEmail } = require('../services/emailService');

console.log('--- Testing Email Configuration via Service Import ---');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Missing');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Missing');
console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);

async function testImportData() {
    try {
        console.log('Calling sendVerificationEmail...');
        await sendVerificationEmail('rafaelmonroigvives@gmail.com', 'TEST_TOKEN_123');
        console.log('Service call completed successfully.');
    } catch (error) {
        console.error('Service call failed:', error);
    }
}

testImportData();
