const bcrypt = require('bcryptjs');

class User {
    static async create(db, userData) {
        const usersCollection = db.collection('user_auth');

        // Hash password if it exists (for local strategy)
        if (userData.password) {
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, salt);
        }

        userData.createdAt = new Date();
        const result = await usersCollection.insertOne(userData);
        return { _id: result.insertedId, ...userData };
    }

    static async findByEmail(db, email) {
        const usersCollection = db.collection('user_auth');
        return await usersCollection.findOne({ email });
    }

    static async findById(db, id) {
        const { ObjectId } = require('mongodb');
        const usersCollection = db.collection('user_auth');
        return await usersCollection.findOne({ _id: new ObjectId(id) });
    }

    static async findByGoogleId(db, googleId) {
        const usersCollection = db.collection('user_auth');
        return await usersCollection.findOne({ googleId });
    }

    static async comparePassword(candidatePassword, hash) {
        return await bcrypt.compare(candidatePassword, hash);
    }
}

module.exports = User;
