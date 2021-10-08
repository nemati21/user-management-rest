const uuid = require('uuid');
const sha = require('sha256');
const model = require('./model');
const customErrors = require('../../custom-errors');

const find = async (id, username) => {
  const user = await model.find(id, username);
  return user;
};

const create = async (firstname, lastname, username, password, role, creator) => {
  const id = uuid.v4();

  const user2 = await find(null, username);
  if (user2) throw new customErrors.UserAlreadyExistError();

  await model.create(id, firstname, lastname, username, sha(password), role, creator);
  return id;
};

const update = async (id, firstname, lastname, username, password, role, updater) => {
  const user = await find(id);
  if (!user) throw new customErrors.UserNotFoundError();

  if (username !== user.username) {
    const existedUser = await find(null, username);
    if (existedUser) throw new customErrors.UserAlreadyExistError();
  }

  if (firstname) user.firstname = firstname;
  if (lastname) user.lastname = lastname;
  if (username) user.username = username;
  if (password) user.password = sha(password);
  if (role) user.role = role;
  if (updater) user.updater = updater;

  const result = await model.update(id, user);
  return result;
};

const remove = async (id) => {
  const user = await find(id);
  if (!user) throw new customErrors.UserNotFoundError();

  const result = await model.remove(user);
  return result;
};

const query = async () => {
  const users = await model.query();
  return users || [];
};

const updatePassword = async (id, oldPassword, newPassword, updater) => {
  const user = await find(id);
  if (!user) throw new customErrors.UserNotFoundError();
  if (user.password !== sha(oldPassword)) throw new customErrors.PasswordIncorrectError();

  user.password = sha(newPassword);
  user.updater = updater;

  const result = await model.updatePassword(user);
  return result;
};

module.exports = {
  create,
  update,
  remove,
  find,
  query,
  updatePassword,
};
