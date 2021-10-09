const uuid = require('uuid');
const sha = require('sha256');
const { client, db } = require('./database');

const seed = async () => {
  try {
    client.connect();
    let user = await db.collection('users').findOne({ username: 'su' });

    if (!user) {
      const now = new Date(new Date() - new Date().getTimezoneOffset() * 60000).toISOString();
      user = { id: uuid.v4(), username: 'su', password: sha('Admin@123'), role: 'admin', createdts: now, updatedts: now };

      await db.collection('users').insertOne(user);
      client.close();
    }
  } catch (err) {
    console.log(err);
  }

  process.exit(0);
};

seed();
