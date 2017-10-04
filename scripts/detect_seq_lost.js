const mongoose = require('mongoose');
const config = require('./src/config');
const logger = require('./src/logger');

const Orderbook = require('./src/models/orderbook');
const Event = require('./src/models/event');

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

const checkLost = (seq) => {
  Event.findOne({seq}).exec()
    .then((event) => {
      if (event) {
        checkLost(seq + 1);
      } else {
        console.log(`${seq} is lost`)
      }
    });
}

initDB()
  .then(() => {
    checkLost(299070232);
  });
