'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Model Schema
 */
var ModelSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Model name',
    trim: true
  },
  public: {
    type: Boolean,
    default: false
  },
  geometric: {
    type: Boolean,
    default: false
  },
  collaborators: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  nodes: [{
    type: Schema.ObjectId,
    ref: 'Node'
  }],
  edges: [{
    type: Schema.ObjectId,
    ref: 'Edge'
  }],
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Model', ModelSchema);
