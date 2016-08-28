import fs from 'fs'
import path from 'path'
import {flowRight, identity} from 'lodash'
import {metersToFeet, gradToDeg, milToDeg, oppositeDeg} from './utils'

const distConverters = {
  'f': identity,
  'F': identity,
  'm': metersToFeet,
  'M': metersToFeet,
}

const angleConverters = {
  'd': identity,
  'D': identity,
  'g': gradToDeg,
  'G': gradToDeg,
  'm': milToDeg,
  'M': milToDeg,
}

export default class OldBreakoutOutputPlugin {
  constructor(options = {}) {
    this.options = options
  }

  apply(program) {
    var file = this.options.file
    var basenameOnlySurveyScans = this.options.basenameOnlySurveyScans
    var fd
    var out
    var currentDir

    program.plugin('beforeParse', function (files) {
      if (file) {
        fd = fs.openSync(file, "w")
        out = function (data) {
          fs.writeSync(fd, data)
        }
      }
      else {
        out = process.stdout.write.bind(process.stdout)
      }

      out('From\tTo\tDistance\tFrontsight Azimuth\tFrontsight Inclination\tBacksight Azimuth\t' +
        'Backsight Inclination\tLeft\tRight\tUp\tDown\tNorth\tEast\tElevation\tDescription\t' +
        'Date\tSurveyors\tComment\tScanned Notes\n')
    })

    program.plugin('afterParse', function () {
      if (file) {
        fs.closeSync(fd)
      }
    })

    program.plugin('parser', function (parser) {
      var tripsByName = {}
      var tripCount = 0
      var stationPositions = {}
      var currentTrip
      var comment
      var multicave = program.multiDirectory

      var convDist
      var convAzmFs
      var convAzmBs
      var convIncFs
      var convIncBs

      parser.plugin('calculatedShot', function (shot) {
        stationPositions[shot.toName] = shot
        return shot
      })

      parser.plugin('beforeRawSurveyFile', function (file) {
        currentTrip = undefined
        currentDir = path.basename(path.dirname(file))
        out = process.stdout.write.bind(process.stdout)
      })
      parser.plugin('trip', function (trip) {
        currentTrip = trip

        convDist = distConverters[trip.distUnit[0]]

        convAzmFs = convAzmBs = angleConverters[trip.azmUnit] || angleConverters.d
        if (trip.backAzmType && trip.backAzmType.toUpperCase() !== 'C') {
          convAzmBs = flowRight(oppositeDeg, convAzmBs)
        }
        convIncFs = convIncBs = angleConverters[trip.incUnit]
        if (trip.backIncType && trip.backIncType.toUpperCase() !== 'C') {
          convIncBs = flowRight(function (a) {
            return -a
          }, convIncBs)
        }
        return trip
      })
      parser.plugin('comment', function (_comment) {
        comment = _comment
        return _comment
      })
      parser.plugin('shot', function (shot) {
        var toStationPosition = stationPositions[shot.to] || {}
        var surveyScan = currentTrip && currentTrip.surveyScan
        if (surveyScan && basenameOnlySurveyScans) {
          surveyScan = path.basename(surveyScan)
        }
        var incFs = shot.incFs
        var incBs = shot.incBs
        if ((isNaN(incFs) || incFs === null) &&
          (isNaN(incBs) || incBs === null)) {
          incFs = 0
        }
        var cols = [
          shot.from,
          shot.to,
          convDist(shot.dist),
          convAzmFs(shot.azmFs),
          incFs,
          convAzmBs(shot.azmBs),
          incBs,
          convDist(shot.l) || 0,
          convDist(shot.r) || 0,
          convDist(shot.u) || 0,
          convDist(shot.d) || 0,
          toStationPosition.y,
          toStationPosition.x,
          toStationPosition.z,
          currentTrip && currentTrip.name,
          currentTrip && currentTrip.date && currentTrip.date.toISOString().substring(0, 10),
          currentTrip && currentTrip.surveyors && currentTrip.surveyors.join(', '),
          comment,
          surveyScan,
        ]
        if (multicave) {
          cols[0] = currentDir + ':' + cols[0]
          cols[1] = currentDir + ':' + cols[1]
        }
        out(cols.map(function (val) {
            return val === undefined || val === null ||
            (typeof val === 'number' && isNaN(val)) ? '' : val
          }).join('\t') + '\n')
        comment = undefined
        return shot
      })
    })
  }
}
