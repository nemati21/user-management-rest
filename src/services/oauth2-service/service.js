const jwt = require('jsonwebtoken');
const sha = require('sha256');
const uuid = require('uuid');
const axios = require('axios').default;

const model = require('./model');
const userService = require('../user-service/service');
const config = require('../../config');
const customError = require('../../custom-errors');

const generateToken = (user, expiry) => {
  const now = Math.floor(Date.now() / 1000);
  const expireTime = now + expiry;

  const token = jwt.sign({
    data: {
      userId: user.id,
      role: user.role,
    },
  }, config.keys.privateKey, {
    algorithm: 'RS256',
    issuer: 'auth.example.ir',
  });

  return {
    token,
    expiresIn: new Date(expireTime * 1000 - (new Date()).getTimezoneOffset() * 60 * 1000).toISOString(),
  };
};

const userserGeo = async () => {
  let result = null;

  result = await axios.get(config.geoBaseUrl, { timeout: 15000 });
  if (result && result.status === 200) result = result.data;

  return result;
};

const implicitAuthenticate = async (username, password) => {
  let token = null;
  let country = '';
  let ip = '';

  // username and password check
  const user = await userService.find(null, username);
  if (!user) throw new customError.UserNotFoundError();

  if (user.password !== sha(password)) throw new customError.AccessDeniedError();

  // If token exists
  token = await model.findToken(user.id);
  if (token) await model.revokeToken(user.id);

  const result = await userserGeo();
  if (result) {
    country = result.country;
    ip = result.query;
  }

  const id = uuid.v4();
  token = generateToken(user, config.tokenExpiry);
  await model.storeToken(id, user.id, token, ip, country, config.tokenExpiry);

  return { id, ...token };
};

module.exports = {
  implicitAuthenticate,
};
