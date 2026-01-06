const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { MongoClient, ObjectId } = require('mongodb');

async function run() {
    console.log('--- DEBUG PARTICIPANT FETCH ---');
    const client = new MongoClient(process.env.MONGO_URI);

    try {
        await client.connect();
        const db = client.db('users'); // Ensure this matches your DB name

        // 1. List some research docs
        const docs = await db.collection('participant_research').find().limit(5).toArray();
        console.log(`Found ${docs.length} participant research docs.`);

        docs.forEach(d => {
            console.log(`\nDoc ID: ${d._id}`);
            console.log(` - MeetingId Type: ${typeof d.meetingId}`);
            console.log(` - MeetingId Value: ${d.meetingId}`);
            if (d.meetingId instanceof ObjectId) {
                console.log(' - MeetingId is ObjectId: YES');
            } else {
                console.log(' - MeetingId is ObjectId: NO');
            }
        });

        if (docs.length > 0) {
            const sampleDoc = docs[0];
            const sampleMeetingIdStr = sampleDoc.meetingId.toString();

            console.log(`\nTesting findByMeetingId with: ${sampleMeetingIdStr}`);

            // Replicate Model Logic
            let query = {};
            try {
                // If the stored ID is a string, and we query with ObjectId, it fails.
                // If stored ID is ObjectId, and we query with ObjectId, it works.
                query = { meetingId: new ObjectId(sampleMeetingIdStr) };
                console.log('Constructed ObjectId query:', query);
            } catch (e) {
                query = { meetingId: sampleMeetingIdStr };
                console.log('Constructed String query:', query);
            }

            const results = await db.collection('participant_research').find(query).toArray();
            console.log(`Query found ${results.length} matches.`);

            if (results.length === 0) {
                console.log('❌ FAIL: Model logic failed to find the document.');

                // Try mismatched query
                if (typeof sampleDoc.meetingId === 'string') {
                    console.log('Document has STRING meetingId. Query used ObjectId. This is the bug.');
                }
            } else {
                console.log('✅ SUCCESS: Model logic found the document.');
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

run();
