'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Node Schema
 */
var NodeSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Node name',
    trim: true
  },
  position: {
    x: {
      type: Number
    },
    y: {
      type: Number
    }
  },
  color: {
    type: String,
    default: '#e1e1e1'
  },
  state1: {
    type: String,
    default: 'state1'
  },
  state2: {
    type: String,
    default: 'state2'
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  leak: {
    type: Number,
    default: 0.5
  }
});

mongoose.model('Node', NodeSchema);
