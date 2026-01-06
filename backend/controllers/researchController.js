const AudioMeeting = require('../models/AudioMeeting');
const { generateMeetingBrief } = require('../services/geminiService');
const { getAuthDb } = require('../config/db');

function getDb() { return getAuthDb(); }

exports.handlePreparation = async (req, res) => {
    try {
        const { topic, participants } = req.body;

        if (!topic) return res.status(400).json({ error: "Topic is required" });
        if (!participants || !Array.isArray(participants) || participants.length === 0) {
            return res.status(400).json({ error: "At least one participant is required" });
        }

        console.log(`[Research] Generating brief for "${topic}"`);

        const briefJson = await generateMeetingBrief(topic, participants);
        const wrapperObj = JSON.parse(briefJson);
        const parsedBrief = wrapperObj.briefData;
        const researchResults = wrapperObj.researchResults || [];

        const db = getDb();
        const userId = req.user ? req.user.id : null;
        const userEmail = req.user ? req.user.email : null;

        // Save as a "Prepared" meeting
        const meetingData = {
            topic: topic,
            brief: parsedBrief,
            status: 'prepared',
            participants: participants,
            userId: userId,
            userEmail: userEmail,
            type: 'preparation',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await AudioMeeting.create(db, meetingData);

        // Save Research Data
        const ParticipantResearch = require('../models/ParticipantResearch');
        for (const r of researchResults) {
            await ParticipantResearch.create(db, {
                meetingId: result._id,
                email: r.email,
                name: r.name,
                company: r.company,
                researchData: r.data
            });
        }

        res.json({
            ...parsedBrief,
            researchResults,
            meetingId: result._id
        });

    } catch (error) {
        console.error("[Research] Preparation failed:", error);
        res.status(500).json({ error: "Failed to generate meeting brief", details: error.message });
    }
};
