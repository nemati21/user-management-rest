const userCtrl = require('../../../services/user-service');
const { schemaTypes } = require('../../../lib');

const customTypes = {
  roleType: {
    type: 'string',
    enum: ['admin', 'staff', 'user'],
  },
};

const swaggerTag = 'User Service';

const tokenHeader = {
  Authorization: { type: 'string', maxLength: 4096 },
};

module.exports = (fastify, options, next) => {
  fastify.post('/', {
    preValidation: [fastify.authenticate],
    schema: {
      description: 'Create User',
      tags: [swaggerTag],
      headers: {
        Authorization: { type: 'string', maxLength: 4096 },
      },
      body: {
        type: 'object',
        required: ['firstname', 'lastname', 'username', 'password', 'role'],
        properties: {
          firstname: schemaTypes.string,
          lastname: schemaTypes.string,
          username: schemaTypes.string,
          password: schemaTypes.string,
          role: customTypes.roleType,
        },
      },
      response: {
        ...schemaTypes.swaggerErrorTypes,
        200: {
          type: 'object',
          properties: {
            id: schemaTypes.uuid,
          },
        },
      },
    },
  }, userCtrl.create);

  fastify.put('/:id', {
    preValidation: [fastify.authenticate],
    schema: {
      description: 'Update User',
      tags: [swaggerTag],
      headers: {
        Authorization: { type: 'string', maxLength: 4096 },
      },
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: schemaTypes.uuid,
        },
      },
      body: {
        type: 'object',
        properties: {
          firstname: schemaTypes.string,
          lastname: schemaTypes.string,
          username: schemaTypes.string,
          password: schemaTypes.string,
          role: customTypes.roleType,
        },
      },
      response: {
        ...schemaTypes.swaggerErrorTypes,
        ...schemaTypes.swagger204,
      },
    },
  }, userCtrl.update);

  fastify.put('/:id/password', {
    preValidation: [fastify.authenticate],
    schema: {
      description: 'Change Password',
      tags: [swaggerTag],
      headers: {
        Authorization: { type: 'string', maxLength: 4096 },
      },
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: schemaTypes.uuid,
        },
      },
      body: {
        type: 'object',
        required: ['oldPassword', 'newPassword'],
        properties: {
          oldPassword: schemaTypes.string,
          newPassword: schemaTypes.string,
        },
      },
      response: {
        ...schemaTypes.swaggerErrorTypes,
        ...schemaTypes.swagger204,
      },
    },
  }, userCtrl.updatePassword);

  fastify.delete('/:id', {
    preValidation: [fastify.authenticate],
    schema: {
      description: 'Delete User',
      tags: [swaggerTag],
      headers: tokenHeader,
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: schemaTypes.uuid,
        },
      },
      response: {
        ...schemaTypes.swaggerErrorTypes,
        ...schemaTypes.swagger204,
      },
    },
  }, userCtrl.remove);

  fastify.get('/users', {
    preValidation: [fastify.authenticate],
    description: 'Inquiry Users',
    tags: [swaggerTag],
    schema: {
      response: {
        ...schemaTypes.swaggerErrorTypes,
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: schemaTypes.uuid,
              firstname: schemaTypes.string,
              lastname: schemaTypes.string,
              username: schemaTypes.string,
              role: customTypes.roleType,
              createdts: schemaTypes.utcdatetime,
              updatedts: schemaTypes.utcdatetime,
            },
          },
        },
      },
      headers: tokenHeader,
    },
  }, userCtrl.query);

  next();
};
