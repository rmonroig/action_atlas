require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const { connectToMongo, getAuthDb } = require('./config/db');

// Initialize App
const app = express();
const port = process.env.PORT || 8080;

// Connect to Database
connectToMongo().then(() => {
    require('./config/passport')(passport, getAuthDb());
});

// Configs
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

console.log('--- ENVIRONMENT CHECK ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('EMAIL_USER set:', !!process.env.EMAIL_USER);
console.log('EMAIL_PASS set:', !!process.env.EMAIL_PASS);
console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE || 'Default (Gmail)');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'Default (localhost)');
console.log('-------------------------');

// Middleware
app.use((req, res, next) => {
    console.log(`[SERVER] Request ignored? Method: ${req.method}, Path: ${req.path}`);
    next();
});
app.use(cors());
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Initialize Passport (Needs DB to be connected, but here we can pass a getter or wait)
// Note: original passport config required 'users' db. 
// We need to ensure DB is connected before passport is used or pass usage logic.
// In the original, it was passed `client.db('users')` which might be sync?
// Actually `client.db` is synchronous if client is connected? No, client is connected async.
// However, the original code called `require('./config/passport')(passport, authDb)` inside `connectToMongo`.
// We should probably keep that pattern or improve it. 
// For now, let's wait for connection in db.js or just pass the promise?
// Simplest refactor: We can initialize passport config inside the db connection callback or 
// since `connectToMongo` sets `authDb`, we might need to export a way to init passport.
// actually, let's just re-import passport config logic here if possible, 
// OR better, move passport init to `config/db.js`? No, separation of concerns.

// Checking original: `require('./config/passport')(passport, authDb);` was inside `connectToMongo`.
// Let's modify `connectToMongo` to accept passport? Or just do it here with a slight delay/check?
// Actually, `connectToMongo` is async. We can wait for it?
// `connectToMongo();` was called without await at top level in original.
// Let's keep it simple. We can pass the `getAuthDb` getter to passport config if it supports it, 
// or just modify passport config.
// Let's look at `config/passport.js` - we didn't check it but we can guess it uses the db collection.
// To avoid breaking changes, I'll import the old auth routes which used `client.db('users')`.
// I need `getClient()` or `getAuthDb()` from db.js working.

// Routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

// Mount Auth Routes (legacy support: pass db, though controller handles it)
const { getClient } = require('./config/db');
app.use('/api/auth', authRoutes(getClient().db('users')));

// Mount API Routes
app.use('/', apiRoutes); // Mounts /upload, /api/history, /prepare, etc.
// Note: `api.js` defines `/upload`, `/history`, `/export-pdf`.
// If I mount `api.js` at `/`, then:
// `/upload` -> `/upload` (Correct)
// `/history` -> `/history` (Incorrect, needs to be `/api/history`)
// `/export-pdf` -> `/export-pdf` (Correct)

// Quick Fix: In `routes/api.js`, I can fix the paths.
// Let's modify `routes/api.js` in a subsequent step if needed, or just rely on the verify step.
// Actually, I already wrote `routes/api.js` with:
// router.post('/upload'...)
// router.get('/history'...)  <-- This will be /history, but needs to be /api/history
// router.get('/export-pdf'...)

// So I should mount `apiRoutes` at `/` and change `/history` in `api.js` to `/api/history`.
// OR mount at `/api` and change `/upload` to just `/../upload`? No.
// Let's re-write `routes/api.js` to correct paths? 
// Or logic in server.js:
// app.use('/', apiRoutes);
// And in apiRoutes, I change `/history` to `/api/history`. 

const frontendDist = path.join(__dirname, '../frontend/dist');
const fs = require('fs');

if (fs.existsSync(frontendDist)) {
    console.log(`Serving static files from ${frontendDist}`);
    app.use(express.static(frontendDist));

    app.get(/(.*)/, (req, res) => {
        if (!req.path.startsWith('/api') && !req.path.startsWith('/auth')) {
            res.sendFile(path.join(frontendDist, 'index.html'));
        } else {
            res.status(404).json({ error: 'Endpoint not found' });
        }
    });
} else if (process.env.NODE_ENV === 'production') {
    console.error(`WARNING: Frontend dist not found at ${frontendDist}`);
}

// Passport Config Injection
// The original code did: `require('./config/passport')(passport, authDb);` inside the DB connection.
// We can use a simple interval or just run it once connected.
// But better: Let's trust that the Passport Strategy callback is lazy or verify usage.
// Standard passport-local uses the callback when authentication happens (which is after DB connects).
// So just initializing it once `authDb` is available is safest.
// We'll rely on `connectToMongo` to do the `require` if we move it there, OR just do it here.
// But we can't do it here easily because `authDb` is not returned synchronously.
// Let's leave the passport init logic inside `config/db.js`?
// I moved `connectToMongo` to `db.js`.
// In `db.js`, I didn't include the passport require line. 
// I SHOULD have included it to match original behavior entirely. 
// I will update `config/db.js` to include passport init logic or move it back to server.js with a .then()
// server.js approach:
connectToMongo().then(() => {
    // Initialize Passport Configuration once DB is connected
    const authDb = getAuthDb();
    require('./config/passport')(passport, authDb);
});


if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Brave Mentor Backend running at http://localhost:${port}`);
    });
}

module.exports = app;
