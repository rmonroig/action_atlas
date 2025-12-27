const axios = require('axios');

const API_URL = 'http://localhost:8080/api/auth';
const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: 'password123'
};

async function verifyAuth() {
    console.log('--- Starting Auth Verification ---');

    try {
        // 1. Register
        console.log(`Step 1: Registering user ${testUser.email}...`);
        const registerRes = await axios.post(`${API_URL}/register`, testUser);
        console.log('Register Response:', registerRes.data);

        // 2. Login
        console.log('Step 2: Logging in...');
        const loginRes = await axios.post(`${API_URL}/login`, testUser);
        console.log('Login Response:', loginRes.data);

        const { token } = loginRes.data;
        if (token) {
            console.log('SUCCESS: JWT Token received.');
        } else {
            console.log('FAILURE: No token received.');
        }

        // 3. Try to register same user again
        console.log('Step 3: Attempting to register same user again (should fail)...');
        try {
            await axios.post(`${API_URL}/register`, testUser);
            console.log('FAILURE: Duplicate registration succeeded when it should have failed.');
        } catch (err) {
            console.log('SUCCESS: Duplicate registration failed as expected:', err.response.data.message);
        }

    } catch (error) {
        console.error('Verification failed:', error.response ? error.response.data : error.message);
    }
}

verifyAuth();
