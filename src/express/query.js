const _ = require('lodash');
const Orderbook = require('../models/orderbook');
const Event = require('../models/event');
const logger = require('../logger');

const getRecentOrderbook = (date) => {
  return Orderbook.findOne({ timestamp: { $lte: date } })
    .sort('-seq')
    .exec();
};

const getEvents = (seq, end) => {
  return Event.findOne({ createdAt: { $lte: end } })
    .sort('-seq')
    .exec()
    .then((event) => {
      return Event.find({
        seq: {
          $gt: seq,
          $lte: event.seq,
        }
      })
      .sort('seq createdAt')
      exec();
    });
}

const handleRemove = (orderbook, data) => {
  if (data.type === 'bid') {
    delete orderbook.bids[data.rate];
  } else {
    delete orderbook.asks[data.rate];
  }
};

const handleModify = (orderbook, data) => {
  const { rate, amount } = data;
  if (data.type === 'bid') {
    orderbook.bids[rate] = { rate, amount };
  } else {
    orderbook.asks[rate] = { rate, amount };
  }
};

const eventHandles = {
  orderBookRemove: handleRemove,
  orderBookModify: handleModify,
};

const getNewOrderbook = (orderbook, events) => {
  const newOrderbook = {};
  newOrderbook.asks = _.indexBy(orderbook.asks, 'rate');
  newOrderbook.bids = _.indexBy(orderbook.bids, 'rate');
  events.forEach((event) => {
    const eventHandle = eventHandles[event.type] || _.noop;
    eventHandle(newOrderbook, event.data);
  });

  const lastEvent = _.last(events);
  newOrderbook.seq = lastEvent.seq;
  newOrderbook.asks = _.values(newOrderbook.asks);
  newOrderbook.bids = _.values(newOrderbook.bids);
  newOrderbook.timestamp = lastEvent.createdAt;

  new Orderbook(newOrderbook).save();
  return newOrderbook;
};

const sendOrderbook = (res, orderbook, depth) => {
  let { timestamp, bids, asks } = orderbook;

  if (depth) {
    bids = _.slice(bids, 0, depth);
    asks = _.slice(asks, 0, depth);
  }
  return res.json({ timestamp, bids, asks });
};

const handleQuery = (req, res) => {
  const time = parseInt(req.query.time, 10);
  const depth = parseInt(req.query.depth, 10);
  const date = new Date(time);

  getRecentOrderbook(date)
    .then((orderbook) => {
      if (orderbook.timestamp.valueOf() === time) {
        return sendOrderbook(res, orderbook, depth);
      }

      logger.info('Do not find matched orderbook. Start to build');

      getEvents(orderbook.seq, date)
        .then((events) => {
          const newOrderbook = getNewOrderbook(orderbook, events);
          return sendOrderbook(res, newOrderbook, depth);
        });
    });
};

module.exports = handleQuery;
