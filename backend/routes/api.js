const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const { handleUpload } = require('../controllers/uploadController');
const { getHistory } = require('../controllers/historyController');
const { exportPdf } = require('../controllers/exportController');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// JWT Middleware (Moved locally or imported if widely used)
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                // Proceed without user if invalid, matching original logic
                console.log("JWT Verification failed:", err.message);
                return next();
            }
            req.user = user;
            next();
        });
    } else {
        next();
    }
};

// Routes
router.post('/upload', authenticateJWT, upload.single('file'), handleUpload);
router.get('/api/history', authenticateJWT, getHistory);
router.get('/export-pdf/:meetingId', exportPdf);

module.exports = router;
