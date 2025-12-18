const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Mock Summary Logic
const generateMockSummary = () => {
    return `Action Atlas Summary:
    
    This audio file explores the concept of "Agentic AI." 
    
    Main Points:
    • Agents can perceive, reason, and act autonomously.
    • The shift from chat-based interfaces to goal-oriented workflow execution.
    • Importance of safety boundaries and human-in-the-loop verification.
    • Future implications for software development and automation.
    
    (Note: This is a simulated summary for the Action Atlas demo.)`;
};

// Routes
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    console.log(`File received: ${req.file.originalname}`);

    // Simulate processing delay (transcription + summarization)
    setTimeout(() => {
        const summary = generateMockSummary();

        // Clean up mock file (optional, but good practice for demo)
        // fs.unlinkSync(req.file.path); 

        res.json({
            filename: req.file.originalname,
            summary: summary,
            status: 'success'
        });
    }, 2000); // 2 seconds delay
});

app.listen(port, () => {
    console.log(`Action Atlas Backend running at http://localhost:${port}`);
});
