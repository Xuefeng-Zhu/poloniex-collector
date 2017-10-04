'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Edge Schema
 */
var EdgeSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Edge name',
    trim: true
  },
  source: {
    type: Schema.ObjectId,
    ref: 'Node'
  },
  target: {
    type: Schema.ObjectId,
    ref: 'Node'
  },
  evidence: {
    type: Schema.ObjectId,
    ref: 'Evidence'
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Edge', EdgeSchema);
