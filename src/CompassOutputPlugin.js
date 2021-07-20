import fs from 'fs'
import path from 'path'
import { flowRight, identity } from 'lodash'
import { metersToFeet, gradToDeg, milToDeg, oppositeDeg } from './utils'

var distUnitMap = {
  FT: 'D',
  FI: 'I',
  M: 'M',
  'M ': 'M',
}

var angleUnitMap = {
  D: 'D',
  G: 'R',
}

var distConverters = {
  f: identity,
  F: identity,
  m: metersToFeet,
  M: metersToFeet,
}

var angleConverters = {
  d: identity,
  D: identity,
  g: gradToDeg,
  G: gradToDeg,
  m: milToDeg,
  M: milToDeg,
}

function niceNum(n) {
  return !isNaN(n) ? n.toFixed(2) : '-999.00'
}

function formatDate(date) {
  if (!date) {
    return '1 1 1900'
  }
  return date.getMonth() + 1 + ' ' + date.getDate() + ' ' + date.getFullYear()
}

function formatSurveyors(surveyors) {
  return surveyors ? surveyors.join(';') : ''
}

function col(text, width) {
  while (text.length < width) {
    text = ' ' + text
  }
  return text
}

function formatTrip(cave, trip) {
  var format = [
    angleUnitMap[trip.azmUnit] || 'D',
    distUnitMap[trip.distUnit] || 'D',
    distUnitMap[trip.distUnit] || 'D',
    'D',
    'L',
    'R',
    'U',
    'D',
    'L',
    'A',
    'D',
    'B',
    'T',
  ]

  return (
    ((cave && cave.name) || '').substring(0, 80) +
    '\r\n' +
    'SURVEY NAME: ' +
    (trip.tripNum || trip.tripNum) +
    ': ' +
    trip.name +
    '\r\n' +
    'SURVEY DATE: ' +
    formatDate(trip.date) +
    '  COMMENT:' +
    trip.name +
    '\r\n' +
    'SURVEY TEAM:\r\n' +
    formatSurveyors(trip.surveyors).substring(0, 100) +
    '\r\n' +
    'DECLINATION: 0.00  FORMAT: ' +
    format.join('') +
    '\r\n' +
    '\r\n' +
    'FROM         TO           LEN     BEAR    INC     LEFT    RIGHT   UP      DOWN    AZM2    INC2    FLAGS COMMENTS\r\n' +
    '\r\n'
  )
}

export default class CompassOutputPlugin {
  constructor(options = {}) {
    this.options = options
  }

  apply(program) {
    var file = this.options.file
    var basenameOnlySurveyScans = this.options.basenameOnlySurveyScans
    var fd
    var out
    var currentDir
    var hasTrips

    program.plugin('beforeParse', function (files) {
      if (file) {
        fd = fs.openSync(file, 'w')
        out = function (data) {
          fs.writeSync(fd, data)
        }
      } else {
        out = process.stdout.write.bind(process.stdout)
      }
    })

    program.plugin('afterParse', function () {
      if (hasTrips) out('\f\r\n')
      if (file) {
        fs.closeSync(fd)
      }
    })

    program.plugin('parser', function (parser) {
      var currentTrip
      var comment
      var cave
      var multicave = program.multiDirectory
      var prefix

      var convDist
      var convAzmFs
      var convAzmBs
      var convIncFs
      var convIncBs

      parser.plugin('cave', function (_cave) {
        cave = _cave
      })

      parser.plugin('beforeRawSurveyFile', function (file) {
        if (hasTrips) out('\f\r\n')
        currentDir = path.basename(path.dirname(file))
        if (multicave) {
          prefix = currentDir.substring(0, 6).replace(/\s/g, '_') + ':'
        }
        out = process.stdout.write.bind(process.stdout)
      })
      parser.plugin('trip', function (trip) {
        currentTrip = trip
        if (hasTrips) out('\f\r\n')
        hasTrips = true

        convDist = distConverters[trip.distUnit[0]]

        convAzmFs = convAzmBs =
          angleConverters[trip.azmUnit] || angleConverters.d
        if (trip.backAzmType && trip.backAzmType[0].toUpperCase() === 'C') {
          convAzmBs = flowRight(oppositeDeg, convAzmBs)
        }
        convIncFs = convIncBs =
          angleConverters[trip.incUnit] || angleConverters.d
        if (trip.backIncType && trip.backIncType[0].toUpperCase() === 'C') {
          convIncBs = flowRight(function (a) {
            return -a
          }, convIncBs)
        }

        out(formatTrip(cave, trip))

        return trip
      })
      parser.plugin('comment', function ({ text: _comment }) {
        if (comment) {
          comment += '\t' + _comment
        } else {
          comment = _comment
        }
        return _comment
      })
      parser.plugin('shot', function (shot) {
        var surveyScan = currentTrip && currentTrip.surveyScan
        if (surveyScan && basenameOnlySurveyScans) {
          surveyScan = path.basename(surveyScan)
        }
        var incFs = shot.incFs
        var incBs = shot.incBs
        if (
          (isNaN(incFs) || incFs === null) &&
          (isNaN(incBs) || incBs === null)
        ) {
          incFs = 0
        }

        var from = shot.from
        var to = shot.to

        if (multicave) {
          from = prefix + from
          to = prefix + to
        }

        var cols = [
          col(from, 12),
          col(to, 12),
          col(niceNum(convDist(shot.dist)), 7),
          col(niceNum(convAzmFs(shot.azmFs)), 7),
          col(niceNum(convIncFs(incFs)), 7),
          col(shot.l < 0 ? -999 : niceNum(convDist(shot.l)), 7),
          col(shot.r < 0 ? -999 : niceNum(convDist(shot.r)), 7),
          col(shot.u < 0 ? -999 : niceNum(convDist(shot.u)), 7),
          col(shot.d < 0 ? -999 : niceNum(convDist(shot.d)), 7),
          col(niceNum(convAzmBs(shot.azmBs)), 7),
          col(niceNum(convIncBs(incBs)), 7),
        ]

        if (shot.exclude || shot.surface) {
          var flags = '#|'
          if (shot.exclude) flags += 'L'
          if (shot.surface) flags += 'P'
          flags += '#'
          cols.push(flags)
        }

        if (comment) {
          cols.push(comment)
        }

        out(cols.join(' ') + '\r\n')
        comment = undefined
        return shot
      })
    })
  }
}
