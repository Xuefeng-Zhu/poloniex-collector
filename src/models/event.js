const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  type: String,
  data: Schema.Types.Mixed,
  seq: Number
}, {
  timestamps: true,
});

module.exports = mongoose.model('Event', eventSchema);
