const {
    transcribeAudio,
    summarizeText,
    researchParticipant,
    summarizeWhatsApp
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
                status: 'completed',
                timestamp: new Date()
            };

            if (req.user && req.user.email) {
                document.userEmail = req.user.email;
                console.log(`Including user in record: ${req.user.email}`);
            }

            // Check if we are updating an existing prepared meeting
            const existingId = req.body.meetingId;
            if (existingId) {
                console.log(`Updating existing meeting: ${existingId}`);
                await summaryCollection.updateOne(
                    { meetingId: existingId },
                    { $set: { ...document, meetingId: existingId } }, // Ensure ID stays same
                    { upsert: true }
                );
                // Use the existing ID for response
                document.meetingId = existingId;
            } else {
                await summaryCollection.insertOne(document);
            }
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
            meetingId: req.body.meetingId || meetingId,
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

// ... existing code ...

async function handleWhatsAppUpload(req, res) {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const meetingId = 'wa-' + Date.now().toString();

    console.log(`WhatsApp file received: ${req.file.originalname}`);
    const filePath = req.file.path;
    const mimeType = req.file.mimetype;
    const language = req.body.language || 'English';

    try {
        // 1. Transcribe
        console.log(`Starting WhatsApp transcription in ${language}...`);
        const transcript = await transcribeAudio(filePath, mimeType, language);

        // 2. Summarize for WhatsApp
        console.log(`Starting WhatsApp summarization...`);
        const summary = await summarizeWhatsApp(transcript, language);

        // 3. Save to MongoDB
        const summaryCollection = getSummaryCollection();

        if (summaryCollection) {
            const document = {
                meetingId: meetingId,
                type: 'whatsapp',
                filename: req.file.originalname,
                transcript: transcript,
                summary: summary,
                timestamp: new Date()
            };

            if (req.user && req.user.email) {
                document.userEmail = req.user.email;
            }

            await summaryCollection.insertOne(document);
        }

        res.json({
            meetingId: meetingId,
            type: 'whatsapp',
            filename: req.file.originalname,
            transcript: transcript,
            summary: summary,
            status: 'success'
        });

    } catch (error) {
        console.error("WhatsApp processing failed:", error);
        res.status(500).json({
            error: "Failed to process WhatsApp audio.",
            details: error.message
        });
    }
}

module.exports = { handleUpload, handleWhatsAppUpload };
