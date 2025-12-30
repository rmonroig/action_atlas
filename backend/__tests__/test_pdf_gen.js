const PDFDocument = require('pdfkit');
const fs = require('fs');

async function testPdfGen() {
    try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream('test_output.pdf');
        doc.pipe(stream);

        // Mock Data
        const meeting = {
            filename: 'Test_Meeting.mp3',
            timestamp: new Date(),
            transcript: 'This is a mock transcript.',
            summary: JSON.stringify({
                outcomes: [
                    "This is a very long outcome that should be detailed and comprehensive. It explains that the team decided to move forward with the new architecture after careful consideration of all the risks involved. The outcome is positive and sets the stage for future growth.",
                    "Another outcome regarding the marketing strategy, which was approved seamlessly."
                ],
                risks: [
                    "Potential delay in Q3 due to supply chain issues.",
                    "Uncertainty about listener engagement with the new format."
                ],
                nextSteps: [
                    "Schedule a follow-up meeting for next Tuesday.",
                    "Complete the API documentation draft."
                ],
                actionItems: [
                    { task: "Update the database schema", owner: "Dev Team", deadline: "Friday" },
                    { task: "Send invites", owner: "Project Manager" }
                ]
            })
        };

        const participants = [
            { name: "Alice Smith", email: "alice@example.com", company: "Tech Corp", researchData: "**Certainty Level**: High\n\nExperienced engineer." },
            { name: "Bob Jones", email: "bob@example.com", researchData: "No info found." }
        ];

        // --- Logic from exportController.js ---

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
            const s = JSON.parse(meeting.summary);

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
            console.error(e);
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

        doc.end();
        console.log("PDF generated successfully: test_output.pdf");

    } catch (error) {
        console.error("PDF Export failed:", error);
    }
}

testPdfGen();
