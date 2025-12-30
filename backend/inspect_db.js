require('dotenv').config();
const { MongoClient } = require('mongodb');

async function inspectData() {
    const client = new MongoClient(process.env.MONGO_URI);
    try {
        await client.connect();
        console.log("Connected to DB");
        const collection = client.db('audio_text').collection('summary_text');

        const latest = await collection.find().sort({ timestamp: -1 }).limit(1).toArray();

        if (latest.length > 0) {
            console.log("Latest Meeting ID:", latest[0].meetingId);
            const summary = latest[0].summary;
            console.log("Type of summary:", typeof summary);

            let parsed = summary;
            if (typeof summary === 'string') {
                try {
                    parsed = JSON.parse(summary);
                    console.log("Parsed JSON successfully.");
                } catch (e) {
                    console.log("Failed to parse summary string:", e.message);
                }
            }

            console.log("Keys in summary:", Object.keys(parsed));
            if (parsed.decisions) console.log("Decisions:", JSON.stringify(parsed.decisions, null, 2));
            else console.log("No 'decisions' key found.");

            if (parsed.actionItems) console.log("Action Items:", JSON.stringify(parsed.actionItems, null, 2));
            else console.log("No 'actionItems' key found.");

        } else {
            console.log("No meetings found.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

inspectData();
