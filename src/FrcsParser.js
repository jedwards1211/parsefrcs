import fs from 'fs'
import Tapable from 'tapable'
import lineReader from 'line-reader'
import { EventEmitter } from 'events'
import parseRawSurvey from './parseRawSurvey'
import parseTripSummaries from './parseTripSummaries'
import parseCalculatedSurvey from './parseCalculatedSurvey'

export default class FrcsParser extends Tapable {
  constructor(files) {
    super()
    this.files = files
  }

  error(error) {
    this.applyPluginsBailResult('error', error)
  }

  parseTripSummaries() {
    var parser = this

    parser.applyPlugins('beforeParseTripSummaries')

    var summaryFiles = this.files.tripSummaries

    summaryFiles &&
      summaryFiles.forEach(function (summaryFile) {
        parser.applyPlugins('beforeSummaryFile', summaryFile)
        var data = fs.readFileSync(summaryFile, { encoding: 'utf8' })
        var summaries = parseTripSummaries(data)
        summaries.forEach(function (summary) {
          summary = parser.applyPluginsWaterfall('tripSummary', summary)
        })
        parser.applyPlugins('afterSummaryFile', summaryFile)
      })

    parser.applyPlugins('afterParseTripSummaries')
  }

  parseRawSurvey(callback) {
    var parser = this

    parser.applyPlugins('beforeParseRawSurvey')

    var events = new EventEmitter()
    ;['cave', 'trip', 'shot', 'comment'].forEach(function (event) {
      events.on(event, function (val) {
        parser.applyPluginsWaterfall(event, val)
      })
    })
    ;['error', 'warning'].forEach(function (event) {
      events.on(event, function (val) {
        parser.applyPluginsBailResult(event, val)
      })
    })

    var rawSurveyFiles = this.files.rawSurvey

    rawSurveyFiles &&
      rawSurveyFiles.forEach(function (file) {
        parser.applyPlugins('beforeRawSurveyFile', file)
        lineReader.eachLineSync(file, parseRawSurvey(events, file))
        parser.applyPlugins('afterRawSurveyFile', file)
      })

    parser.applyPlugins('afterParseRawSurvey')
  }

  parseCalculatedSurvey() {
    var parser = this

    parser.applyPlugins('beforeParseCalculatedSurvey')

    var events = new EventEmitter()
    events.on('calculatedShot', function (shot) {
      parser.applyPluginsWaterfall('calculatedShot', shot)
    })

    var calcSurveyFiles = this.files.calculatedSurvey

    calcSurveyFiles &&
      calcSurveyFiles.forEach(function (file) {
        parser.applyPlugins('beforeCalculatedSurveyFile', file)
        lineReader.eachLineSync(file, parseCalculatedSurvey(events))
        parser.applyPlugins('afterCalculatedSurveyFile', file)
      })

    parser.applyPlugins('afterParseCalculatedSurvey')
  }
}
