/* eslint-disable security/detect-non-literal-fs-filename */
const os = require('os');
const fs = require('fs');
const cluster = require('cluster');

const app = require('./server');
const config = require('./config');
const { setConsoleMessage } = require('./lib');
const { client } = require('./database');

if (cluster.isMaster) {
  console.log(setConsoleMessage(`MODE is ${config.env}`, 'INFO'));
  let numCPUs = os.cpus().length;
  if (config.env.toLowerCase() === 'development') numCPUs = 0;

  for (let i = 0; i < numCPUs; i += 1) {
    cluster.fork();
  }

  cluster.on('death', (worker) => {
    console.log(setConsoleMessage(`Worker ${worker.pricess.pid} died!`, 'WARNING'));
    cluster.fork();
    console.log(setConsoleMessage(`Worker ${worker.pricess.pid} reforked!`, 'INFO'));
  });

  (async () => {
    client.connect()
      .then(() => {
        console.log(setConsoleMessage('Connection to service', 'OK'));
      })
      .catch((err) => {
        console.log(setConsoleMessage(`Connection to service. ERROR: ${err}`, 'ERROR'));
        client.close();
        process.exit(1);
      });
  })();
}
if (cluster.isWorker || config.env.toLowerCase() === 'development') {
  config.keys.publicKey = fs.readFileSync(config.keys.publicKeyFile);
  config.keys.privateKey = fs.readFileSync(config.keys.privateKeyFile);
}

process.on('uncaughtException', (err) => {
  console.log(setConsoleMessage('Uncaught Exception happened: ', 'ERROR'), err);
  app.log.error(err);
});

process.on('unhandledRejection', (reason, p) => {
  console.log(setConsoleMessage('Unhandled Rejection happened: ', 'ERROR'), reason, p);
  app.log.error(reason);
});

process.on('exit', () => {
  console.log(setConsoleMessage('Service stopped.', 'INFO'));
  app.log.info('Service stopped.');
});

if (app.start) app.start();
