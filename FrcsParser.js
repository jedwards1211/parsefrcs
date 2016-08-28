'use strict';

var fs = require('fs');
var path = require('path');
var Tapable = require('tapable');
var lineReader = require('line-reader');
var EventEmitter = require('events').EventEmitter;
var parseRawSurvey = require('./parseRawSurvey');
var parseTripSummaries = require('./parseTripSummaries');
var parseCalculatedSurvey = require('./parseCalculatedSurvey');

var FrcsParser = module.exports = function(files) {
  Tapable.call(this);
  this.files = files;
}

FrcsParser.prototype = Object.create(Tapable.prototype);

FrcsParser.prototype.parseTripSummaries = function() {
  var parser = this;

  parser.applyPlugins('beforeParseTripSummaries');

  var summaryFiles = this.files.tripSummaries;

  summaryFiles && summaryFiles.forEach(function(summaryFile) {
    parser.applyPlugins('beforeSummaryFile', summaryFile);
    var data = fs.readFileSync(summaryFile, {encoding: 'utf8'});
    var summaries = parseTripSummaries(data);
    summaries.forEach(function(summary) {
      summary = parser.applyPluginsWaterfall('tripSummary', summary);
    });
    parser.applyPlugins('afterSummaryFile', summaryFile);
  });

  parser.applyPlugins('afterParseTripSummaries');
}

FrcsParser.prototype.parseRawSurvey = function(callback) {
  var parser = this;

  parser.applyPlugins('beforeParseRawSurvey');

  var events = new EventEmitter();
  ['cave', 'trip', 'shot', 'comment'].forEach(function(event) {
    events.on(event, function(val) {
      parser.applyPluginsWaterfall(event, val);
    });
  });

  var rawSurveyFiles = this.files.rawSurvey;

  rawSurveyFiles && rawSurveyFiles.forEach(function(file) {
    var skip = false;
    parser.applyPlugins('beforeRawSurveyFile', file);
    lineReader.eachLineSync(file, parseRawSurvey(events));
    parser.applyPlugins('afterRawSurveyFile', file);
  });

  parser.applyPlugins('afterParseRawSurvey');
}

FrcsParser.prototype.parseCalculatedSurvey = function() {
  var parser = this;
  
  parser.applyPlugins('beforeParseCalculatedSurvey');

  var events = new EventEmitter();
  events.on('calculatedShot', function(shot) {
    parser.applyPluginsWaterfall('calculatedShot', shot);
  });

  var calcSurveyFiles = this.files.calculatedSurvey;

  calcSurveyFiles && calcSurveyFiles.forEach(function(file) {
    parser.applyPlugins('beforeCalculatedSurveyFile', file);
    lineReader.eachLineSync(file, parseCalculatedSurvey(events));
    parser.applyPlugins('afterCalculatedSurveyFile', file);
  });

  parser.applyPlugins('afterParseCalculatedSurvey');
}
