const mongoose = require('mongoose');
const config = require('./src/config');
const logger = require('./src/logger');
const Collector = require('./src/collector');
const app = require('./src/express');

mongoose.Promise = Promise;

const initDB = () => new Promise(
  (resolve, reject) => mongoose.connect(config.db,
    { server: { socketOptions: { keepAlive: 1 } } }, (err) => {
      if (err) {
        reject(`unable to connect to database: ${config.db}`);
      }

      logger.info(`Mongoose connected at : ${config.db}`);
      // print mongoose logs in dev env
      if (config.MONGOOSE_DEBUG) {
        mongoose.set('debug', (collectionName, method, query, doc) => {
          logger.debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
        });
      }
      // Returns the promise
      resolve();
    }));

initDB()
  .then(() => {
    // new Collector().start();
    app.listen(config.port, () => {
      logger.info(`server started on port ${config.port} (${config.env})`);
    })
  });
