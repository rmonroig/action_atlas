const PDFDocument = require('pdfkit');
const { getSummaryCollection, getParticipantsCollection } = require('../config/db');

async function exportPdf(req, res) {
    try {
        const { meetingId } = req.params;
        const summaryCollection = getSummaryCollection();
        const participantsCollection = getParticipantsCollection();

        if (!summaryCollection) {
            return res.status(503).json({ error: 'Database not initialized' });
        }

        const meeting = await summaryCollection.findOne({ meetingId: meetingId });

        if (!meeting) {
            return res.status(404).json({ error: "Meeting not found" });
        }

        let participants = [];
        if (participantsCollection) {
            participants = await participantsCollection.find({ meetingId: meetingId }).toArray();
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
}

module.exports = { exportPdf };
