const { MongoClient } = require('mongodb');
const uuid = require('uuid');
const sha = require('sha256');

const config = require('./config');

// Connect to MongoDB
const url = `mongodb://${config.db.username}:${config.db.password}@${config.db.url}`;
const client = new MongoClient(url);

const db = client.db(config.db.name);

const seed = async () => {
  let user = await db.collection('users').findOne({ username: 'su' });

  if (!user) {
    const now = new Date(new Date() - new Date().getTimezoneOffset() * 60000).toISOString();
    user = { id: uuid.v4(), username: 'su', password: sha('Admin@123'), role: 'admin', createdts: now, updatedts: now };

    await db.collection('users').insertOne(user);
  }
};

module.exports = {
  client,
  db,
  seed,
};