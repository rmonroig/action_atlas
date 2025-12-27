const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:8080';
const testUser = {
    email: `verify_${Date.now()}@example.com`,
    password: 'password123'
};

const FormData = require('form-data');

async function verifyUploadWithUser() {
    console.log('--- Starting Verification: Upload with User ---');

    try {
        // 1. Register
        console.log(`Step 1: Registering user ${testUser.email}...`);
        await axios.post(`${API_URL}/api/auth/register`, testUser);
        console.log('Register successful.');

        // 2. Login
        console.log('Step 2: Logging in...');
        const loginRes = await axios.post(`${API_URL}/api/auth/login`, testUser);
        const { token } = loginRes.data;
        console.log('Login successful, token received.');

        // 3. Upload a file
        console.log('Step 3: Uploading a file with token...');
        const audioFilePath = path.join(__dirname, '..', 'uploads', fs.readdirSync(path.join(__dirname, '..', 'uploads'))[0] || 'test.mp3');

        // If no file exists, we'll just fail gracefully or create a dummy one if possible
        if (!fs.existsSync(audioFilePath)) {
            console.log('No audio file found in uploads for testing. Please ensure at least one file exists or provide a test file.');
            return;
        }

        const formData = new FormData();
        formData.append('file', fs.createReadStream(audioFilePath));

        const uploadRes = await axios.post(`${API_URL}/upload`, formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Upload Response:', uploadRes.data);

        if (uploadRes.data.status === 'success') {
            console.log('SUCCESS: Upload completed with user token.');
        } else {
            console.log('FAILURE: Upload failed.');
        }

    } catch (error) {
        console.error('Verification failed:', error.response ? error.response.data : error.message);
    }
}

verifyUploadWithUser();
