const PDFDocument = require('pdfkit');
const AudioMeeting = require('../models/AudioMeeting');
const ParticipantResearch = require('../models/ParticipantResearch');
const { getAuthDb } = require('../config/db');

function getDb() { return getAuthDb(); }

async function exportPdf(req, res) {
    try {
        const { meetingId } = req.params;
        const db = getDb();

        // Support both ObjectId and legacy ID lookup?
        // AudioMeeting model supports findById (ObjectId)
        // If meetingId is legacy (string timestamp), we might fail if we only use findById.
        // But the new controllers return `_id` (ObjectId).
        // So assuming frontend now passes ObjectId.
        // If frontend passes legacy ID, we might need a fallback find.
        // Let's assume ObjectId for now as we are refactoring.
        // Actually, let's make findById robust in AudioMeeting or use logic here.

        let meeting = await AudioMeeting.findById(db, meetingId);

        // Fallback for legacy IDs (timestamp strings) if not found by ObjectId
        if (!meeting) {
            const collection = db.collection('audio_meetings');
            meeting = await collection.findOne({ meetingId: meetingId });
        }

        if (!meeting) {
            return res.status(404).json({ error: "Meeting not found" });
        }

        // Fetch participants
        let participants = [];
        // Try new model first
        participants = await ParticipantResearch.findByMeetingId(db, meeting._id);

        // If none found, check if they are legacy embedded or strictly in new table
        // New logic saves them to ParticipantResearch. 
        // Legacy data might not be there.
        // If legacy, we might find them in `meeting.participants` if we had migrated? 
        // Or in legacy `participants` collection with `meetingId` string.
        if (participants.length === 0) {
            const pCollection = db.collection('participants');
            // legacy collection name might differ? `getParticipantsCollection` used `participants`
            if (pCollection) {
                participants = await pCollection.find({ meetingId: meetingId }).toArray();
            }
        }

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

            if (s.outcomes && s.outcomes.length > 0) {
                doc.fontSize(14).font('Helvetica-Bold').text('Key Outcomes');
                s.outcomes.forEach(o => doc.fontSize(11).font('Helvetica').text(`• ${o}`, { indent: 20, align: 'justify' }));
                doc.moveDown();
            }

            if (s.risks && s.risks.length > 0) {
                doc.fontSize(14).font('Helvetica-Bold').text('Risks & Open Questions');
                s.risks.forEach(r => doc.fontSize(11).font('Helvetica').text(`• ${r}`, { indent: 20 }));
                doc.moveDown();
            }

            if (s.nextSteps && s.nextSteps.length > 0) {
                doc.fontSize(14).font('Helvetica-Bold').text('Next Steps');
                s.nextSteps.forEach(n => doc.fontSize(11).font('Helvetica').text(`• ${n}`, { indent: 20 }));
                doc.moveDown();
            }

            if (s.actionItems && s.actionItems.length > 0) {
                doc.fontSize(14).font('Helvetica-Bold').text('Action Items');
                s.actionItems.forEach(a => {
                    doc.fontSize(11).font('Helvetica-Bold').text(`Task: ${a.task}`, { indent: 20 });
                    if (a.owner || a.deadline) {
                        doc.fontSize(9).font('Helvetica-Oblique').text(`${a.owner ? 'Owner: ' + a.owner : ''} ${a.deadline ? '| Deadline: ' + a.deadline : ''}`, { indent: 40 });
                    }
                    doc.moveDown(0.5);
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
        doc.fillColor('#000000').fontSize(10).font('Helvetica').text(meeting.transcript || "No transcript available.", { lineGap: 2 });

        doc.end();

    } catch (error) {
        console.error("PDF Export failed:", error);
        res.status(500).json({ error: "Failed to generate PDF" });
    }
}

module.exports = { exportPdf };
