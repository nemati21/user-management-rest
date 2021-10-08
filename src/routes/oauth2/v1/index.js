const oauthCtrl = require('../../../services/oauth2-service');
const { schemaTypes } = require('../../../lib');

const swaggerTag = 'Authentication Service';

module.exports = (fastify, options, next) => {
  // last step of authorization code which generates token. API will be called by client.
  // implicit, client_credentials and password types which provided token directly in one step. API will be called by user/client.
  fastify.post('/login', {
    schema: {
      description: 'Login',
      tags: [swaggerTag],
      body: {
        type: 'object',
        properties: {
          username: schemaTypes.string,
          password: schemaTypes.string,
        },
      },
    },
  }, oauthCtrl.authenticate);

  next();
};
