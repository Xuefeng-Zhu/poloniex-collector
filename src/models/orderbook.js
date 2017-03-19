const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const recordSchema = new Schema({
	rate: {
		type: Number,
	},
	amount:{
		type: Number,
	}
})

const orderbookSchema = new Schema({
	bids: [recordSchema],
	asks: [recordSchema],
  seq: Number,
  timestamp: Date,
}, {
		timestamps: true,
	});

module.exports = mongoose.model('Orderbook', orderbookSchema);
