'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var rangeSchema = new Schema({
  low: {
    type: Number,
    min: 0,
    max: 1
  },
  high: {
    type: Number,
    min: 0,
    max: 1
  },
  memo: {
    type: String
  }
});

/**
 * Evidence Schema
 */
var EvidenceSchema = new Schema({
  title: {
    type: String,
    default: '',
    required: 'Please fill Evidence name',
    trim: true
  },
  year: {
    type: Number
  },
  authors: [{
    type: String,
    trim: true,
  }],
  type: {
    type: String
  },
  publisher: {
    type: String
  },
  parentKeywords: [{
    type: String,
    trim: true,
  }],
  childKeywords: [{
    type: String,
    trim: true,
  }],
  m1: rangeSchema,
  m2State1: rangeSchema,
  m2State2: rangeSchema,
  m3: rangeSchema,
  text: {
    type: String
  },
  file: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  },
  edge: {
    type: Schema.ObjectId,
    ref: 'Edge'
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  authorOverlap: {
    type: Boolean,
    default: false
  }
});

mongoose.model('Evidence', EvidenceSchema);
