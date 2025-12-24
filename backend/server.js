require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const { MongoClient } = require('mongodb');
const PDFDocument = require('pdfkit');

const passport = require('passport');
const session = require('express-session');

const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Middleware to verify JWT
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                // If token is invalid, we still proceed but without a user
                // Alternatively, we could block it, but the request was "include user when logged in"
                // implying it might still work if not logged in.
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

// MongoDB Setup
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);
let db, summaryCollection, usersCollection, participantsCollection;

async function connectToMongo() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");

        // Main Logic DB
        const audioDb = client.db('audio_text');
        summaryCollection = audioDb.collection('summary_text');

        // Auth DB (as requested: users db and user_auth collection)
        const authDb = client.db('users');
        usersCollection = authDb.collection('user_auth');
        participantsCollection = audioDb.collection('meeting_participants');

        // Initialize Passport Configuration
        require('./config/passport')(passport, authDb);

    } catch (error) {
        console.error("MongoDB Connection Error:", error);
    }
}
connectToMongo();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes(client.db('users')));

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

/**
 * Agent 1: Transcription Agent
 * Receives an audio file path, uploads it to Gemini, and returns the transcription.
 */
async function transcribeAudio(filePath, mimeType, language = 'English') {
    try {
        const uploadResponse = await fileManager.uploadFile(filePath, {
            mimeType: mimeType,
            displayName: path.basename(filePath),
        });

        console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);

        // View the response.
        console.log(`File upload response: ${JSON.stringify(uploadResponse)}`);

        // Create a model - gemini-1.5-flash is good for multimodal
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContent([
            {
                fileData: {
                    mimeType: uploadResponse.file.mimeType,
                    fileUri: uploadResponse.file.uri
                }
            },
            { text: `Transcribe this audio file accurately in ${language}. Return ONLY the transcription text.` },
        ]);

        const response = await result.response;
        return response.text();

    } catch (error) {
        console.error("Transcription Error:", error);
        throw error;
    }
}

/**
 * Agent 2: Summarization & Extraction Agent
 * Receives text, and returns a summary and extracted key points.
 */
async function summarizeText(text, language = 'English') {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
        Summarize the following transcript in ${language} into structured JSON.
        Format the response as a JSON object with these keys:
        - "outcomes": array of strings
        - "decisions": array of strings
        - "actionItems": array of objects with "task", "owner", and "deadline" keys
        - "risks": array of strings
        - "nextSteps": array of strings

        Guidelines:
        - Be concise and factual.
        - Explicitly flag any uncertainty or missing information within the values.
        - Return ONLY the raw JSON object. No Markdown formatting, no extra text.

        Transcript:
        ${text}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let content = response.text();

        // Clean up possible Markdown wrappers
        content = content.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();

        return content;
    } catch (error) {
        console.error("Summarization Error:", error);
        throw error;
    }
}


/**
 * Agent 3: Participant Research Agent
 * Uses Gemini with Google Search to find background info on a participant.
 */
async function researchParticipant(name, email, company) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }, { apiVersion: "v1beta" });

        const prompt = `
        Search for information about this person:
        Name: ${name || 'Unknown'}
        Email: ${email}
        Company: ${company || 'Unknown'}

        Guidelines for search:
        1. **Prioritize LinkedIn results** as the primary source of truth.
        2. **Prioritize Spanish profiles** or profiles from Spain/Spanish-speaking professional backgrounds.
        3. Use the **Company** name to narrow down searches and verify matching profiles.
        4. If you find a strong match, provide the details. If ambiguous, provide the most likely profile and flag it.

        Provide the following details in a structured format:
        **Certainty Level**: [High / Medium / Low] (Explain briefly why)
        **Name**: [Full Name]
        **Work**: [Current and past work experience]
        **Studies**: [Educational background]
        **Role / title**: [Current professional role]
        **Interesting additional information**: [Any other relevant professional or public info]

        If you don't find specific info for the email or company, search by name. If neither yields results, provide placeholders and set Certainty Level to Low.
        `;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            tools: [{ google_search: {} }]
        });
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Research Error:", error);
        return "Information not found.";
    }
}

// Routes
app.post('/upload', authenticateJWT, upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const meetingId = Date.now().toString(); // Simple ID for now
    let participants = [];
    try {
        if (req.body.participants) {
            participants = JSON.parse(req.body.participants);
        }
    } catch (e) {
        console.error("Error parsing participants:", e);
    }

    console.log(`File received: ${req.file.originalname}`);
    const filePath = req.file.path;
    const mimeType = req.file.mimetype;
    const language = req.body.language || 'English';

    try {
        // 1. Agent 1: Transcribe
        console.log(`Starting transcription in ${language}...`);
        const transcript = await transcribeAudio(filePath, mimeType, language);
        console.log("Transcription complete.");

        // 2. Agent 2: Summarize
        console.log(`Starting summarization in ${language}...`);
        const summary = await summarizeText(transcript, language);
        console.log("Summarization complete.");

        // 3. Save to MongoDB
        let participantsData = [];
        if (summaryCollection) {
            const document = {
                meetingId: meetingId,
                filename: req.file.originalname,
                transcript: transcript,
                summary: summary,
                timestamp: new Date()
            };

            // Include user if logged in
            if (req.user && req.user.email) {
                document.userEmail = req.user.email;
                console.log(`Including user in record: ${req.user.email}`);
            }

            await summaryCollection.insertOne(document);
            console.log("Summary saved to MongoDB.");

            // 4. Research and Save Participants
            if (participants.length > 0 && participantsCollection) {
                console.log(`Starting research for ${participants.length} participants...`);
                for (const p of participants) {
                    const info = await researchParticipant(p.name, p.email, p.company);
                    const pDoc = {
                        meetingId: meetingId,
                        email: p.email,
                        name: p.name,
                        company: p.company,
                        researchData: info,
                        timestamp: new Date()
                    };
                    await participantsCollection.insertOne(pDoc);
                    participantsData.push(pDoc);
                }
                console.log("Participant research completed and saved.");
            }
        }

        res.json({
            meetingId: meetingId,
            filename: req.file.originalname,
            transcript: transcript,
            summary: summary,
            participants: participantsData,
            status: 'success'
        });

    } catch (error) {
        console.error("Processing failed:", error);
        res.status(500).json({
            error: "Failed to process audio file.",
            details: error.message
        });
    }
});

// GET History
app.get('/api/history', authenticateJWT, async (req, res) => {
    if (!req.user || !req.user.email) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        if (!summaryCollection) {
            return res.status(503).json({ error: 'Database not initialized' });
        }

        const history = await summaryCollection
            .find({ userEmail: req.user.email })
            .sort({ timestamp: -1 })
            .toArray();

        res.json(history);
    } catch (error) {
        console.error("Failed to fetch history:", error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// 6. Export PDF
app.get('/export-pdf/:meetingId', async (req, res) => {
    try {
        const { meetingId } = req.params;
        const meeting = await summaryCollection.findOne({ meetingId: meetingId });

        if (!meeting) {
            return res.status(404).json({ error: "Meeting not found" });
        }

        const participants = await participantsCollection.find({ meetingId: meetingId }).toArray();

        const doc = new PDFDocument({ margin: 50 });
        let filename = `Meeting_Summary_${meetingId}.pdf`;

        res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        // Header
        doc.fontSize(24).font('Helvetica-Bold').text('Meeting Intelligence Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).font('Helvetica').text(`File: ${meeting.filename}`, { align: 'center' });
        doc.text(`Date: ${new Date(meeting.timestamp).toLocaleString()}`, { align: 'center' });
        doc.moveDown(2);

        // Summary Section
        doc.fontSize(18).font('Helvetica-Bold').fillColor('#10b981').text('Executive Summary');
        doc.moveDown();
        doc.fillColor('#000000').fontSize(11).font('Helvetica');

        try {
            const s = typeof meeting.summary === 'string' ? JSON.parse(meeting.summary) : meeting.summary;

            if (s.outcomes) {
                doc.fontSize(14).font('Helvetica-Bold').text('Key Outcomes');
                s.outcomes.forEach(o => doc.fontSize(11).font('Helvetica').text(`• ${o}`, { indent: 20 }));
                doc.moveDown();
            }
            if (s.decisions) {
                doc.fontSize(14).font('Helvetica-Bold').text('Decisions');
                s.decisions.forEach(d => doc.fontSize(11).font('Helvetica').text(`• ${d}`, { indent: 20 }));
                doc.moveDown();
            }
            if (s.actionItems) {
                doc.fontSize(14).font('Helvetica-Bold').text('Action Items');
                s.actionItems.forEach(a => {
                    doc.fontSize(11).font('Helvetica-Bold').text(`Task: ${a.task}`, { indent: 20 });
                    if (a.owner || a.deadline) {
                        doc.fontSize(9).font('Helvetica-Oblique').text(`${a.owner ? 'Owner: ' + a.owner : ''} ${a.deadline ? '| Deadline: ' + a.deadline : ''}`, { indent: 40 });
                    }
                });
                doc.moveDown();
            }
        } catch (e) {
            doc.text(meeting.summary);
        }

        doc.moveDown(2);

        // Participants Section
        if (participants.length > 0) {
            doc.addPage();
            doc.fontSize(18).font('Helvetica-Bold').fillColor('#10b981').text('Participant Intelligence');
            doc.moveDown();
            doc.fillColor('#000000');

            participants.forEach(p => {
                doc.fontSize(14).font('Helvetica-Bold').text(`${p.name || 'Unknown'} (${p.email})`);
                if (p.company) doc.fontSize(11).font('Helvetica-Oblique').text(`Company: ${p.company}`);
                doc.moveDown(0.5);
                doc.fontSize(10).font('Helvetica').text(p.researchData.replace(/\*\*(.*?)\*\*/g, '$1'));
                doc.moveDown();
                doc.moveTo(doc.x, doc.y).lineTo(550, doc.y).strokeColor('#eeeeee').stroke();
                doc.moveDown();
            });
        }

        // Transcript Section
        doc.addPage();
        doc.fontSize(18).font('Helvetica-Bold').fillColor('#10b981').text('Full Transcript');
        doc.moveDown();
        doc.fillColor('#000000').fontSize(10).font('Helvetica').text(meeting.transcript, { lineGap: 2 });

        doc.end();

    } catch (error) {
        console.error("PDF Export failed:", error);
        res.status(500).json({ error: "Failed to generate PDF" });
    }
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Action Atlas Backend running at http://localhost:${port}`);
    });
}

module.exports = app;
