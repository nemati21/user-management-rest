const { db } = require('../../database');

const create = async (id, firstname, lastname, username, password, role, creator) => {
  await db.collection('users').insertOne({
    id,
    firstname,
    lastname,
    username,
    password,
    role,
    creator,
    createdts: new Date(new Date() - new Date().getTimezoneOffset() * 60000).toISOString(),
    updatedts: new Date(new Date() - new Date().getTimezoneOffset() * 60000).toISOString(),
  });

  return true;
};

const find = async (id, username) => {
  let user;

  try {
    if (id) {
      user = await db.collection('users').findOne({ id }, { projection: { _id: 0 } });
    } else if (username) {
      user = await db.collection('users').findOne({ username }, { projection: { _id: 0 } });
    }
  } catch (err) {
    user = null;
  }

  return user;
};

const query = async () => {
  let users = null;

  try {
    users = await db.collection('users').find({}).toArray();
  } catch (err) {
    console.log(err);
    users = null;
  }

  return users;
};

const update = async (id, user) => {
  const now = new Date(new Date() - new Date().getTimezoneOffset() * 60000).toISOString();
  await db.collection('users').updateOne({ id },
    {
      $set:
      {
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        password: user.password,
        role: user.role,
        updater: user.updater,
        updatedts: now,
      },
    }, { upsert: true });

  return true;
};

const updatePassword = async (user) => {
  const now = new Date(new Date() - new Date().getTimezoneOffset() * 60000).toISOString();
  await db.collection('users').updateOne({ id: user.id },
    {
      $set:
      {
        password: user.password,
        updater: user.updater,
        updatedts: now,
      },
    }, { upsert: true });

  return true;
};

const remove = async (user) => {
  await db.collection('users').deleteOne({ id: user.id });
  return true;
};

module.exports = {
  create,
  find,
  query,
  update,
  updatePassword,
  remove,
};
