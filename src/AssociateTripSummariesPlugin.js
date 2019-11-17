import path from 'path'
import _ from 'lodash'

export default class AssociateTripSummariesPlugin {
  constructor(options = {}) {
    this.options = options
  }
  apply(program) {
    program.plugin('parser', function (parser) {
      var currentDir
      var tripMap = {}
      var tripCounts = {}

      parser.plugin('beforeSummaryFile', function (file) {
        currentDir = path.dirname(file)
        tripMap[currentDir] = []
      })

      parser.plugin('tripSummary', function (summary) {
        tripMap[currentDir][summary.tripNum] = summary
        return summary
      })

      parser.plugin('beforeRawSurveyFile', function (file) {
        currentDir = path.dirname(file)
        tripMap[currentDir] = []
        tripCounts[currentDir] = 0
      })
      parser.plugin('trip', function (trip) {
        var tripNum = ++tripCounts[currentDir]
        var summary = tripMap[currentDir][tripNum]
        return _.assign({}, trip, summary, {
          tripNum,
          name: trip.name || summary.name,
        })
      })
    })
  }
}
