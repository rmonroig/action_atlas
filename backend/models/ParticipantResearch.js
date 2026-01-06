const { ObjectId } = require('mongodb');

class ParticipantResearch {
    static async create(db, researchData) {
        const collection = db.collection('participant_research');
        researchData.researchedAt = new Date();
        const result = await collection.insertOne(researchData);
        return { _id: result.insertedId, ...researchData };
    }

    static async findByMeetingId(db, meetingId) {
        const collection = db.collection('participant_research');

        const possibleIds = [meetingId];
        if (typeof meetingId === 'string' && ObjectId.isValid(meetingId)) {
            try {
                possibleIds.push(new ObjectId(meetingId));
            } catch (e) { /* ignore */ }
        } else if (meetingId instanceof ObjectId) {
            possibleIds.push(meetingId.toString());
        }

        return await collection.find({ meetingId: { $in: possibleIds } }).toArray();
    }

    static async findByEmail(db, email) {
        const collection = db.collection('participant_research');
        return await collection.findOne({ email });
    }

    static async updateResearch(db, id, researchText) {
        if (!ObjectId.isValid(id)) return null;
        const collection = db.collection('participant_research');
        await collection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    researchData: researchText,
                    researchedAt: new Date()
                }
            }
        );
        return await collection.findOne({ _id: new ObjectId(id) });
    }
}

module.exports = ParticipantResearch;
