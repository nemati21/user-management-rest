const service = require('./service');
const customError = require('../../custom-errors');

const authenticate = async (req, res) => {
  const { username, password } = req.body;

  const token = await service.implicitAuthenticate(username, password);
  if (!token) throw new customError.AccessDeniedError();

  token.type = 'Bearer';

  return res.send(token);
};

module.exports = {
  authenticate,
};
