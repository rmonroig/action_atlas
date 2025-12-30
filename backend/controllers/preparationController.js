const { generateMeetingBrief, researchParticipant } = require('../services/geminiService');
const { getSummaryCollection, getParticipantsCollection } = require('../config/db');

async function handlePreparation(req, res) {
    try {
        const { topic, participants } = req.body;

        if (!topic) {
            return res.status(400).json({ error: "Topic is required" });
        }

        if (!participants || !Array.isArray(participants) || participants.length === 0) {
            return res.status(400).json({ error: "At least one participant is required" });
        }

        const meetingId = Date.now().toString();

        console.log(`Generating brief for topic: "${topic}" with ${participants.length} participants`);

        const briefJson = await generateMeetingBrief(topic, participants);
        const parsedBrief = JSON.parse(briefJson);

        // Save to MongoDB
        const summaryCollection = getSummaryCollection();
        const participantsCollection = getParticipantsCollection();

        if (summaryCollection) {
            const document = {
                meetingId: meetingId,
                topic: topic,
                brief: parsedBrief,
                status: 'prepared',
                timestamp: new Date()
            };

            if (req.user && req.user.email) {
                document.userEmail = req.user.email;
            }

            await summaryCollection.insertOne(document);
        }

        // Save participants separately if needed, but for now linking to meetingId is key
        // Note: We've already researched them inside generateMeetingBrief, but that data isn't exposed directly as objects yet.
        // For simplicity, we assume generateMeetingBrief handles the research aggregation. 
        // Ideally, we would refactor to save individual participant research records here too.

        res.json({
            ...parsedBrief,
            meetingId: meetingId
        });

    } catch (error) {
        console.error("Preparation failed:", error);
        res.status(500).json({ error: "Failed to generate meeting brief" });
    }
}

module.exports = { handlePreparation };
