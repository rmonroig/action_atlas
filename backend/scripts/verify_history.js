const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_URL = 'http://localhost:3000';
const testUser = {
    email: `history_verify_${Date.now()}@example.com`,
    password: 'password123'
};

async function verifyHistory() {
    console.log('--- Starting Verification: Transcription History ---');

    try {
        // 1. Register
        console.log(`Step 1: Registering user ${testUser.email}...`);
        await axios.post(`${API_URL}/api/auth/register`, testUser);
        console.log('Register successful.');

        // 2. Login
        console.log('Step 2: Logging in...');
        const loginRes = await axios.post(`${API_URL}/api/auth/login`, testUser);
        const { token } = loginRes.data;
        console.log('Login successful.');

        // 3. Upload a file
        console.log('Step 3: Uploading a file to create history...');
        const uploadDir = path.join(__dirname, '..', 'uploads');
        const files = fs.readdirSync(uploadDir);
        const audioFile = files.find(f => f.endsWith('.mp3') || f.endsWith('.wav') || f.endsWith('.m4a'));

        if (!audioFile) {
            console.log('No audio file found for upload test.');
            return;
        }

        const audioFilePath = path.join(uploadDir, audioFile);
        const formData = new FormData();
        formData.append('file', fs.createReadStream(audioFilePath));

        await axios.post(`${API_URL}/upload`, formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Upload successful.');

        // 4. Fetch History
        console.log('Step 4: Fetching history...');
        const historyRes = await axios.get(`${API_URL}/api/history`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('History fetched:', historyRes.data.length, 'items found.');

        if (historyRes.data.length > 0) {
            const firstItem = historyRes.data[0];
            console.log('Latest history item:', {
                filename: firstItem.filename,
                timestamp: firstItem.timestamp,
                hasTranscript: !!firstItem.transcript,
                hasSummary: !!firstItem.summary
            });
            console.log('SUCCESS: History feature is working!');
        } else {
            console.error('FAILURE: History is empty after upload.');
        }

    } catch (error) {
        console.error('Verification failed:', error.response ? error.response.data : error.message);
    }
}

verifyHistory();
