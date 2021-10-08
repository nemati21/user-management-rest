const cluster = require('cluster');
const fastify = require('fastify');
const swagger = require('fastify-swagger');
const fastifyJWT = require('fastify-jwt');

const userRoutes = require('./routes/user/v1');
const oauthRoutes = require('./routes/oauth2/v1');
const config = require('./config');
const { setConsoleMessage, setErrorResponse } = require('./lib');

const app = fastify({
  logger: {
    level: config.logger.level,
    file: config.logger.file,
    serializers: {
      res(res) {
        return {
          statusCode: res.statusCode,
          request: res.raw.input,
          payload: res.raw.payload,
        };
      },
    },
  },
  pluginTimeout: 1000,
  ignoreTrailingSlash: true,
  bodyLimit: 102400,
  keppAliveTimeout: 15000,
});

if (cluster.isWorker || config.env.toLowerCase() === 'development') {
  app.addHook('onSend', (request, reply, payload, next) => {
  //  reply.header('Access-Control-Allow-Origin', '*');
  //  reply.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Origin, Cache-Control');
  //  reply.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');

    let data;
    try {
      if (payload && payload.length && (payload.startsWith('{') || payload.startsWith('['))) data = JSON.parse(payload);
      if (Array.isArray(data) && data.length > 3) data = 'bulk-data';
      else if (payload.length > 1024) data = 'bulk-data';
    } catch {
      data = null;
    }

    Object.assign(reply.res, {
      payload: data || undefined,
      input: {
        method: request.raw.method,
        url: request.raw.url,
        query: request.query,
        body: request.body || undefined,
        headers: request.headers,
      },
    });

    next();
  });

  app.setErrorHandler((err, req, res) => {
    console.log(setConsoleMessage(`Error occured on ${req.raw.method} ${req.raw.url}`, 'ERROR'), err);
    app.log.error({
      request: {
        url: req.raw.url,
        method: req.raw.method,
        headers: req.raw.headers,
        body: req.body,
        query: req.query,
      },
      err,
    });

    setErrorResponse(err, res);
  });

  app.setNotFoundHandler({}, (req, res) => setErrorResponse(404, res));

  app.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      console.log(err);
      reply.code(401).send('');
    }
  });

  app.start = () => {
    app.register(swagger, config.documentation);
    app.register(fastifyJWT, {
      secret: {
        public: config.keys.publicKey,
        private: config.keys.privateKey,
      },
      sign: {
        algorithm: 'RS256',
        issuer: 'auth.example.ir',
      },
      verify: {
        algorithms: ['RS256'],
        issuer: 'auth.example.ir',
      },
      messages: {
        badRequestErrorMessage: 'UNAUTHORIZED_ERROR: Format is Authorization: Bearer [token]',
        noAuthorizationInHeaderMessage: 'UNAUTHORIZED_ERROR: Autorization header is missing!',
        authorizationTokenExpiredMessage: 'UNAUTHORIZED_ERROR: Authorization token expired',
        // for the below message you can pass a sync function that must return a string as shown or a string
        authorizationTokenInvalid: (err) => `UNAUTHORIZED_ERROR: Authorization token is invalid: ${err.message}`,
      },
    });

    app.register(oauthRoutes, { prefix: '/api/v1/auth' });
    app.register(userRoutes, { prefix: '/api/v1/user' });

    app.ready((err) => {
      app.swagger();

      if (err) return console.log(setConsoleMessage('Cannot start fastify because of an error', 'ERROR'), err);
      (async () => {
        try {
          app.listen(config.server.port, '0.0.0.0', (listenErr, address) => {
            if (listenErr) {
              console.log(setConsoleMessage('Cannot start server because of error:', 'ERROR'), listenErr.message);
              throw new Error(listenErr);
            } else {
              console.log(setConsoleMessage(`Service is ready, listening on ${address}`, 'OK'));
            }
          });
        } catch (e) {
          process.exit(1);
        }
      })();
      return true;
    });
  };
}

module.exports = app;
