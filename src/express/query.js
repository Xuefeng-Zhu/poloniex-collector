const _ = require('lodash');
const Orderbook = require('../models/orderbook');
const Event = require('../models/event');
const logger = require('../logger');

const getRecentOrderbook = (date) => {
  return Orderbook.findOne({ timestamps: { $lte: date } })
    .sort('-seq')
    .exec();
};

const getEvents = (seq, end) => {
  return Event.find({
    seq: {
      $gt: seq,
    },
    createdAt: {
      $lte: end,
    },
  })
  .sort('createdAt')
  exec();
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
  newOrderbook.timestamps = events.createdAt;

  new Orderbook(newOrderbook).save();
  return newOrderbook;
};

const handleQuery = (req, res) => {
  const time = parseInt(req.query.time, 10);
  const date = new Date(time);

  getRecentOrderbook(date)
    .then((orderbook) => {
      if (orderbook.timestamps.valueOf() === time) {
        res.json(orderbook);
      }

      logger.info('Do not find matched orderbook. Start to build');

      getEvents(orderbook.seq, date)
        .then((events) => {
          const newOrderbook = getNewOrderbook(orderbook, events);
          res.json(newOrderbook);
        });
    });
};

module.exports = handleQuery;
