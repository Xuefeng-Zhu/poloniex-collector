const autobahn = require('autobahn');
const request = require('request');
const config = require('./config');
const logger = require('./logger');
const Orderbook = require('./models/orderbook');
const Event = require('./models/event');

const { market, depth, pollFrequency } = config;
const orderbookApi = `https://poloniex.com/public?command=returnOrderBook&currencyPair=${market}&depth=${depth}`;
const socketUrl = 'wss://api.poloniex.com';

class Collector {
  constructor() {
    this.connection = new autobahn.Connection({
      url: socketUrl,
      realm: "realm1"
    });

    this.connection.onopen = (session) => {
      session.subscribe(market, this.onMarketEvent.bind(this));
    }
  }

  start() {
    this.connection.open();
    this.fetchOrderbook();

    setInterval(() => {
      this.fetchOrderbook();
    }, pollFrequency);
  }

  onMarketEvent(marketEvents, meta, details) {
    const { seq } = meta;
    // console.log(seq)
    // if (!this.prevSeq) {
    //   this.prevSeq = seq;
    // } else {
    //   if (seq - this.prevSeq > 1) {
    //     logger.info('Seq was dropped. Fetch full order book');
    //     this.fetchOrderbook();
    //   }

    //   this.prevSeq = seq;
    // }

    marketEvents.forEach((marketEvent) => {
      const { type, data } = marketEvent;
      new Event({ type, data, seq }).save();
    })
  }

  fetchOrderbook() {
    request(orderbookApi, function (error, response, body) {
      if (error) {
        logger.error('error:', error);
      }

      let { asks, bids, seq } = JSON.parse(body);
      asks = asks.map((item) => ({
        rate: item[0],
        amount: item[1],
      }));

      bids = bids.map((item) => ({
        rate: item[0],
        amount: item[1],
      }));

      new Orderbook({
        asks,
        bids,
        seq,
        timestamp: new Date()
      }).save();
    });
  }
}

module.exports = Collector;
