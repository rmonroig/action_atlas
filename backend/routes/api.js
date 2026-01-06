const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const meetingController = require('../controllers/meetingController');
const researchController = require('../controllers/researchController');
const exportController = require('../controllers/exportController');

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

// JWT Middleware
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                console.log("JWT Verification failed:", err.message);
                return next(); // Proceed unauthenticated (matching legacy behavior)
            }
            req.user = user;
            next();
        });
    } else {
        next();
    }
};

// Routes
router.post('/upload', authenticateJWT, upload.single('file'), meetingController.handleUpload);
router.post('/upload-whatsapp', authenticateJWT, upload.single('file'), meetingController.handleWhatsAppUpload);
router.post('/prepare', authenticateJWT, researchController.handlePreparation);
router.get('/meeting/:id', authenticateJWT, meetingController.getMeeting);
router.get('/api/history', authenticateJWT, meetingController.getHistory);
router.get('/export-pdf/:meetingId', exportController.exportPdf);

module.exports = router;
