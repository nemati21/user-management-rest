const { db } = require('../../database');

const storeToken = async (id, userId, token, ip, country, tokenExpiry) => {
  const now = new Date(new Date() - new Date().getTimezoneOffset() * 60000).toISOString();

  const result = await db.collection('auth').insertOne({
    id,
    userId,
    ...token,
    ip,
    country,
    expiry: tokenExpiry,
    createdts: now,
    updatedts: now,
  });

  return result;
};

const findToken = async (id) => {
  let token = null;

  try {
    token = await db.collection('auth').findOne({ userId: id });
  } catch (err) {
    token = null;
  }

  return token;
};

const revokeToken = async (id) => {
  try {
    await db.collection('auth').deleteOne({ userId: id });
  } catch (err) {
    return false;
  }

  return true;
};


module.exports = {
  storeToken,
  findToken,
  revokeToken,
};
