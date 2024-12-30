// db.js
const { MongoClient } = require('mongodb');


const client = new MongoClient(process.env.MONGODB_URL);

let db;

async function connect() {
    if (!db) {
        await client.connect();
        db = client.db(process.env.MONGODB_DBNAME);
    }
    return db;
}

module.exports = { connect };