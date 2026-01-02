const { MongoClient } = require('mongodb');
require('dotenv').config();

async function removeUser() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('Please provide an email address as an argument.');
        console.log('Usage: node scripts/remove-user.js <email>');
        process.exit(1);
    }
    const email = args[0];

    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('Error: MONGO_URI environment variable is not defined.');
        process.exit(1);
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to DB');

        const db = client.db('users');
        const collection = db.collection('user_auth');

        const result = await collection.deleteOne({ email: email });

        if (result.deletedCount === 1) {
            console.log(`Successfully deleted user with email: ${email}`);
        } else {
            console.log(`No user found with email: ${email}`);
        }

    } catch (e) {
        console.error('Error deleting user:', e);
    } finally {
        await client.close();
    }
}

removeUser();
