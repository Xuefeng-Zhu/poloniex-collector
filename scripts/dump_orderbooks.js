const mongoose = require('mongoose');
const moment = require('moment');
const fs = require('fs');
const _ = require('lodash');

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

const bucketOrders = (list) => {
  const result = {};
  _.each(list, function(order) {
    const rate = order.rate.toFixed(6);
    if (result[rate]) {
      result[rate].amount += order.amount;
    } else {
      result[rate] = {
        rate: parseFloat(rate),
        amount: order.amount
      }
    }
  });

  return _(result)
        .values()
        .sortBy('-rate')
        .slice(0, 1000)
        .value();
};

const end = moment();

const getOrderbooks = (date) => {
  Orderbook.findOne({
    timestamp: {
      $gte: date.toDate(),
      $lt: moment(date).add(20, 'seconds').toDate()
    }
  })
  .sort('timestamp')
  .exec()
    .then((orderbook) => {
      if (orderbook) {
        const bids = bucketOrders(orderbook.bids);
        const asks = bucketOrders(orderbook.asks);
        fs.writeFileSync(`result/${orderbook.timestamp.valueOf()}.json`, JSON.stringify({
          bids,
          asks,
          seq: orderbook.seq
        }));
      } else {
        console.log('did not find' + date);
      }

      if (date < end) {
        getOrderbooks(moment(date.add(10, 'seconds')));
      }
    });
}

initDB()
  .then(() => {
    const start = moment('2017-03-20 04:40:05.690Z');
    getOrderbooks(moment(start));
  });
