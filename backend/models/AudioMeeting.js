const { ObjectId } = require('mongodb');

class AudioMeeting {
    static async create(db, meetingData) {
        const collection = db.collection('audio_meetings');
        meetingData.createdAt = new Date();
        meetingData.updatedAt = new Date();
        meetingData.status = meetingData.status || 'uploaded'; // uploaded, processing, completed, error

        // Ensure userId is stored as ObjectId
        if (meetingData.userId && typeof meetingData.userId === 'string') {
            try {
                meetingData.userId = new ObjectId(meetingData.userId);
            } catch (e) {
                // Keep as string if not a valid ObjectId (unlikely for our app)
                console.warn('[AudioMeeting] userId is not a valid ObjectId:', meetingData.userId);
            }
        }

        const result = await collection.insertOne(meetingData);
        return { _id: result.insertedId, ...meetingData };
    }

    static async findById(db, id) {
        if (!ObjectId.isValid(id)) return null;
        const collection = db.collection('audio_meetings');
        return await collection.findOne({ _id: new ObjectId(id) });
    }

    static async findByUserId(db, userId) {
        const collection = db.collection('audio_meetings');

        // Construct query to match either String or ObjectId version of userId
        // This handles legacy data (String) and new fixed data (ObjectId) AND intermediate bugged data (String)
        const possibleIds = [userId];

        if (typeof userId === 'string' && ObjectId.isValid(userId)) {
            try {
                possibleIds.push(new ObjectId(userId));
            } catch (e) { /* ignore */ }
        } else if (userId instanceof ObjectId) {
            possibleIds.push(userId.toString());
        }

        return await collection.find({ userId: { $in: possibleIds } }).sort({ createdAt: -1 }).toArray();
    }

    static async update(db, id, updateData) {
        if (!ObjectId.isValid(id)) return null;
        const collection = db.collection('audio_meetings');
        updateData.updatedAt = new Date();

        // Ensure userId is stored as ObjectId if present in update
        if (updateData.userId && typeof updateData.userId === 'string') {
            try {
                updateData.userId = new ObjectId(updateData.userId);
            } catch (e) {
                console.warn('[AudioMeeting] userId in update is not a valid ObjectId:', updateData.userId);
            }
        }

        await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        return await this.findById(db, id);
    }

    static async updateTranscript(db, id, transcript) {
        return await this.update(db, id, { transcript });
    }

    static async updateSummary(db, id, summary) {
        return await this.update(db, id, { summary, status: 'completed' });
    }
}

module.exports = AudioMeeting;
