const { MongoClient } = require('mongodb');

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);

let db;
let summaryCollection;
let usersCollection;
let participantsCollection;
let authDb;

async function connectToMongo() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");

        // Main Logic DB
        const audioDb = client.db('audio_text');
        summaryCollection = audioDb.collection('summary_text');
        participantsCollection = audioDb.collection('meeting_participants');

        // Auth DB
        authDb = client.db('users');
        usersCollection = authDb.collection('user_auth');

    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    }
}

function getSummaryCollection() {
    return summaryCollection;
}

function getParticipantsCollection() {
    return participantsCollection;
}

function getUsersCollection() {
    return usersCollection;
}

function getAuthDb() {
    return authDb;
}

function getClient() {
    return client;
}

module.exports = {
    connectToMongo,
    getSummaryCollection,
    getParticipantsCollection,
    getUsersCollection,
    getAuthDb,
    getClient
};
