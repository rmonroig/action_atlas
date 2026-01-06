const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const API_URL = 'http://localhost:8080';
const TEST_EMAIL = 'test-refactor-' + Date.now() + '@example.com';
const TEST_PASSWORD = 'password123';

async function runTest() {
    console.log('--- STARTING BACKEND REFACTOR TEST (using fetch) ---');

    try {
        // 1. Register
        console.log(`\n1. Registering user: ${TEST_EMAIL}`);
        const regRes = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
        });

        if (!regRes.ok) {
            const err = await regRes.text();
            console.error('❌ Registration failed:', err);
            process.exit(1);
        }
        console.log('✅ Registration request sent.');

        // 2. Verify Email (Manually via DB)
        console.log('\n2. Verifying user directly in DB...');
        const client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
        const db = client.db('users');
        const user = await db.collection('user_auth').findOne({ email: TEST_EMAIL });

        if (!user) {
            console.error('❌ User not found in DB!');
            process.exit(1);
        }

        await db.collection('user_auth').updateOne(
            { _id: user._id },
            { $set: { isVerified: true }, $unset: { verificationToken: "" } }
        );
        console.log('✅ User manually verified in DB.');
        await client.close();

        // 3. Login
        console.log('\n3. Logging in...');
        const loginRes = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
        });

        if (!loginRes.ok) {
            const err = await loginRes.text();
            console.error('❌ Login failed:', err);
            process.exit(1);
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('✅ Login successful. Token received.');

        // 4. Upload Audio
        console.log('\n4. Uploading test audio...');
        // Create a dummy file
        const dummyPath = path.join(__dirname, 'test-audio.txt');
        fs.writeFileSync(dummyPath, 'This is a mock audio file content.');

        // Construct multipart body manually or use boundary trick, but fetching with file is tricky in node without FormData lib.
        // Node 22 fetch supports FormData? Yes.
        const formData = new FormData();
        const fileBlob = new Blob([fs.readFileSync(dummyPath)], { type: 'text/plain' });
        formData.append('file', fileBlob, 'test-audio.txt');
        formData.append('language', 'English');

        try {
            const uploadRes = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // boundary handled auto by fetch+FormData
                },
                body: formData
            });

            console.log('✅ Upload response status:', uploadRes.status);
            const uploadText = await uploadRes.text();
            console.log('Response:', uploadText);
        } catch (e) {
            console.log('ℹ️ Upload request error:', e.message);
        }

        fs.unlinkSync(dummyPath);

        // 5. Check History
        console.log('\n5. Checking History...');
        const historyRes = await fetch(`${API_URL}/api/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (historyRes.ok) {
            const history = await historyRes.json();
            console.log(`✅ History fetched. Items: ${history.length}`);
        } else {
            console.error('❌ Failed to fetch history:', await historyRes.text());
        }

        console.log('\n--- TEST COMPLETE ---');

    } catch (err) {
        console.error('Test script error:', err);
    }
}

runTest();
