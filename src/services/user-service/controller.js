const service = require('./service');
const customErrors = require('../../custom-errors');
const config = require('../../config');

const create = async (req, res) => {
  const { firstname, lastname, username, password, role } = req.body;
  const requestUser = req.user;

  if (!(config.authScopeUrls[requestUser.data.role].registerUrl)) {
    throw new customErrors.AccessDeniedError();
  }

  const user = await service.find(null, username.trim());
  if (user) throw new customErrors.UserAlreadyExistError();

  const result = await service.create(firstname, lastname, username, password, role, requestUser.data.userId);

  res.code(200).send({ id: result });
};

const update = async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, username, password, role } = req.body;
  const requestUser = req.user;

  if (!(config.authScopeUrls[requestUser.data.role].updateUrl)) {
    throw new customErrors.AccessDeniedError();
  }

  await service.update(id, firstname, lastname, username, password, role, requestUser.data.userId);
  return res.code(204).send('');
};

const remove = async (req, res) => {
  const { id } = req.params;

  // check if requester has access to this function
  if (!(config.authScopeUrls[req.user.data.role].removeUrl)) {
    throw new customErrors.AccessDeniedError();
  }

  await service.remove(id);
  return res.code(204).send('');
};

const query = async (req, res) => {
  if (!(config.authScopeUrls[req.user.data.role].queryUrl)) {
    throw new customErrors.AccessDeniedError();
  }

  const users = await service.query();

  return res.send(users);
};

const updatePassword = async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;
  const requestUser = req.user;

  if (!(config.authScopeUrls[requestUser.data.role].changePassUrl)) {
    throw new customErrors.AccessDeniedError();
  }

  await service.updatePassword(id, oldPassword, newPassword, requestUser.data.userId);
  return res.code(204).send('');
};

module.exports = {
  create,
  update,
  remove,
  query,
  updatePassword,
};
