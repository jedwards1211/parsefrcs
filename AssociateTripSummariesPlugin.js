'use strict'

var path = require('path')
var _ = require('lodash')

function AssociateTripSummariesPlugin(options) {
  this.options = options || {}
}

AssociateTripSummariesPlugin.prototype.apply = function(program) {
  program.plugin('parser', function(parser) {
    var currentDir
    var tripMap = {}
    var tripCounts = {}

    parser.plugin('beforeSummaryFile', function(file) {
      currentDir = path.dirname(file)
      tripMap[currentDir] = []
    })

    parser.plugin('tripSummary', function(summary) {
      tripMap[currentDir][summary.tripNum] = summary
      return summary
    })

    parser.plugin('beforeRawSurveyFile', function(file) {
      currentDir = path.dirname(file)
      tripMap[currentDir] = tripMap[currentDir] || []
      tripCounts[currentDir] = tripCounts[currentDir] || 0
    })
    parser.plugin('trip', function(trip) {
      var tripNum = ++tripCounts[currentDir]
      var summary = tripMap[currentDir][tripNum]
      return _.assign({}, summary, trip)
    })
  })
}

module.exports = AssociateTripSummariesPlugin
