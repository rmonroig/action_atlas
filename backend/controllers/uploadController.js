const {
    transcribeAudio,
    summarizeText,
    researchParticipant
} = require('../services/geminiService');
const {
    getSummaryCollection,
    getParticipantsCollection
} = require('../config/db');

async function handleUpload(req, res) {
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
        const summaryCollection = getSummaryCollection(); // Get collection lazily

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
            const participantsCollection = getParticipantsCollection();
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
}

module.exports = { handleUpload };
