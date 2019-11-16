import fs from 'fs'
import path from 'path'
import proj4 from 'proj4'
import {flowRight, identity, kebabCase} from 'lodash'
import {metersToFeet, gradToDeg, milToDeg, oppositeDeg} from './utils'

import { getUTMZone, getUTMGridConvergence } from "./geo/utm";

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
  'f': identity,
  'F': identity,
  'm': metersToFeet,
  'M': metersToFeet,
}

var angleConverters = {
  'd': identity,
  'D': identity,
  'g': gradToDeg,
  'G': gradToDeg,
  'm': milToDeg,
  'M': milToDeg,
}

function niceNum(n) {
  return !isNaN(n) ? n.toFixed(2) : '-999.00'
}

function formatDate(date) {
  if (!date) {
    return '1 1 1900'
  }
  return (date.getMonth() + 1) + ' ' + date.getDate() + ' ' + date.getFullYear()
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
    'L', 'R', 'U', 'D',
    'L', 'A', 'D',
    'B',
    'T',
  ]

  return ((cave && cave.name) || '').substring(0, 80) + '\r\n' +
    'SURVEY NAME: ' + (trip.tripNum || trip.tripNum) + ': ' + (trip.name) + '\r\n' +
    'SURVEY DATE: ' + formatDate(trip.date) + '  COMMENT:' + (trip.name) + '\r\n' +
    'SURVEY TEAM:\r\n' +
    formatSurveyors(trip.surveyors).substring(0, 100) + '\r\n' +
    'DECLINATION: 0.00  FORMAT: ' + format.join('') + '\r\n' +
    '\r\n' +
    'FROM         TO           LEN     BEAR    INC     LEFT    RIGHT   UP      DOWN    AZM2    INC2    FLAGS COMMENTS\r\n' +
    '\r\n'
}


function optionalNum(n) {
  return isNaN(n) || n === null ? '--' : String(n)
}

function anglePair(fs, bs) {
  if (isNaN(fs)) fs = undefined
  if (isNaN(bs)) bs = undefined
  if (bs !== undefined) {
    return optionalNum(fs) + '/' + String(bs)
  }
  return optionalNum(fs)
}

function anyValid(args) {
  for (var i = 0; i < arguments.length; i++) {
    if (!isNaN(arguments[i]) && arguments[i] !== null) {
      return true
    }
  }
}

export default class WallsOutputPlugin {
  constructor(options = {}) {
    this.options = options || {}
  }

  apply(program) {
    var project = this.options.project
    var extraUnits = this.options.extraUnits

    var currentDir
    var frcsFiles
    var resources
    var multicave = program.multiDirectory
    var hasTrips
    var basenameOnlySurveyScans = this.options.basenameOnlySurveyScans

    var alllocation
    var datout
    var datfile
    var allmakfile = 'allcaves.mak'
    var allmakout = fs.createWriteStream(allmakfile)
    allmakout.write('!OT;\r\n')
    var chipallmakfile = 'allcaves.chipxyz.mak'
    var chipallmakout = fs.createWriteStream(chipallmakfile)
    chipallmakout.write('!OT;\r\n')

    program.plugin('beforeParse', function (files) {
      frcsFiles = files
      if (project && !fs.existsSync(project)) {
        process.stderr.write('Creating directory ' + project + '...')
        fs.mkdirSync(project)
        process.stderr.write('done.\n')
      }
    })

    program.plugin('parser', function (parser) {
      var fd
      var cave

      var currentTrip
      var comment
      var prefix

      var convDist
      var convAzmFs
      var convAzmBs
      var convIncFs
      var convIncBs
      var calculatedShots = []

      parser.plugin('cave', function (cave) {
        hasTrips = false
        datfile = `${kebabCase(cave.name)}.dat`
        if (datout) {
          datout.end()
          console.error(`wrote ${datfile}`)
        }
        datout = fs.createWriteStream(datfile)

        var location
        var utmZone
        var convergence

        const fixedStations = []
        const chipXYZFixedStations = []

        if (calculatedShots.length &&
            Array.isArray(resources.fixedStations) &&
            resources.fixedStations.length
        ) {
          var fromCrs
          var toCrs
          var proj
          for (const line of resources.fixedStations) {
            if (typeof line === 'string') {
              fromCrs = line
              if (toCrs) proj = proj4(fromCrs, toCrs)
              continue
            }
            if (Array.isArray(line)) {
              if (!fromCrs) throw new Error(`a coordinate reference system must come before fixed stations`)
              const [station, x, y, z] = line
              if (!location) {
                const [lon, lat] = proj4(fromCrs, '+proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees').forward([x, y])
                utmZone = getUTMZone(lat, lon)
                toCrs = `+proj=utm +zone=${utmZone} +ellps=WGS84 +datum=WGS84 +units=m`
                proj = proj4(fromCrs, toCrs)
                location = proj.forward([x, y])
                location.push(z)
                convergence = getUTMGridConvergence({
                  lat,
                  lon,
                })
                if (!alllocation) {
                  alllocation = location
                  allmakout.write(`@${location.join(',')},${utmZone},${convergence};\r\n`)
                  allmakout.write('&WGS 1984;\r\n')
                  chipallmakout.write(`@${location.join(',')},${utmZone},${convergence};\r\n`)
                  chipallmakout.write('&WGS 1984;\r\n')
                }
              }
              const converted = proj.forward([x, y])
              fixedStations.push([station, 'M', converted[0], converted[1], z])
            }
          }
        }

        if (location) {
          calculatedShots.forEach(({toName, x, y, z}) => {
            chipXYZFixedStations.push([toName, 'M', location[0] + x, location[1] + y, location[2] + z])
          })
        }

        function writeFixedStations(location, stations, out) {
          stations.forEach(([station, unit, easting, northing, elevation]) => {
            out.write(`,\r\n  ${station}[${unit},${(easting - location[0]).toFixed(3)},${(northing - location[1]).toFixed(3)},${(elevation - location[2]).toFixed(3)}]`)
          })
        }

        allmakout.write(`#${datfile}`)
        writeFixedStations(alllocation, fixedStations, allmakout)
        allmakout.write(';\r\n')
        chipallmakout.write(`#${datfile}`)
        writeFixedStations(alllocation, fixedStations, chipallmakout)
        writeFixedStations(alllocation, chipXYZFixedStations, chipallmakout)
        chipallmakout.write(';\r\n')

        var makfile = `${kebabCase(cave.name)}.mak`
        var makout = fs.createWriteStream(makfile)
        makout.write('!OT;\r\n')
        if (location) {
          makout.write(`@${location.join(',')},${utmZone},${convergence};\r\n`)
          makout.write('&WGS 1984;\r\n')
        }
        makout.write(`#${datfile}`)
        writeFixedStations(location, fixedStations, makout)
        makout.write(';\r\n')
        makout.end()
        console.error(`wrote ${makfile}`)

        makfile = `${kebabCase(cave.name)}.chipxyz.mak`
        makout = fs.createWriteStream(makfile)
        makout.write('!OT;\r\n')
        if (location) {
          makout.write(`@${location.join(',')},${utmZone},${convergence};\r\n`)
          makout.write('&WGS 1984;\r\n')
        }
        makout.write(`#${datfile}`)
        writeFixedStations(location, fixedStations, makout)
        writeFixedStations(location, chipXYZFixedStations, makout)
        makout.write(';\r\n')
        makout.end()
        console.error(`wrote ${makfile}`)
      })

      // var fixFileNameMap = {}

      parser.plugin('beforeParseCalculatedSurvey', function () {
        // if (project) {
        //   // map calculated survey files to unique 8 char + .srv filenames
        //   var usedFixFileNames = {}
        //   frcsFiles.calculatedSurvey.forEach(function (calculatedFile) {
        //     var outFile = path.basename(calculatedFile)
        //     var ext = path.extname(outFile)
        //     outFile = outFile.substring(0, outFile.length - ext.length)
        //     if (usedFixFileNames[outFile.toLowerCase()]) {
        //       var num = 0
        //       var newName
        //       do {
        //         num++
        //         newName = outFile.substring(0, 8 - Math.floor(Math.log(num) / Math.log(10)) - 2) +
        //           '~' + num
        //       } while (usedFixFileNames[newName.toLowerCase()])
        //       outFile = newName
        //     }
        //     usedFixFileNames[outFile.toLowerCase()] = true
        //     fixFileNameMap[calculatedFile] = outFile + '.srv'
        //   })
        // }
      })

      parser.plugin('beforeCalculatedSurveyFile', function (file) {
        resources = program.getResources(path.dirname(file))
        // out = process.stdout.write.bind(process.stdout)
        //
        // if (project) {
        //   var outFile = path.join(project, fixFileNameMap[file])
        //   process.stderr.write('Writing ' + outFile + '...')
        //   fd = fs.openSync(outFile, "w")
        //   out = function (data) {
        //     fs.writeSync(fd, data)
        //   }
        //
        //   out(';')
        //   out(path.basename(file))
        //   out('\r\n\r\n')
        // }
        // out('#units reset f order=enu ')
        // if (extraUnits) out(extraUnits)
        // out('\r\n')
        // if (multicave) {
        //   out('#prefix ' + path.basename(currentDir) + '\r\n')
        // }
        // out('\r\n')
      })
      parser.plugin('calculatedShot', function (shot) {
        calculatedShots.push(shot)
        // out([
        //   '#fix',
        //   shot.toName,
        //   shot.x,
        //   shot.y,
        //   shot.z,
        //   '\r\n',
        // ].join('\t'))
        return shot
      })
      parser.plugin('afterCalculatedSurveyFile', function (file) {
        if (project) {
          fs.closeSync(fd)
          process.stderr.write('done.\r\n')
        }
      })

      parser.plugin('beforeRawSurveyFile', function (file) {
        currentDir = path.dirname(file)
      })
      parser.plugin('trip', function (trip) {
        currentTrip = trip
        if (hasTrips) datout.write('\f\r\n')
        hasTrips = true

        convDist = distConverters[trip.distUnit[0]]

        convAzmFs = convAzmBs = angleConverters[trip.azmUnit] || angleConverters.d
        if (trip.backAzmType && trip.backAzmType[0].toUpperCase() === 'C') {
          convAzmBs = flowRight(oppositeDeg, convAzmBs)
        }
        convIncFs = convIncBs = angleConverters[trip.incUnit] || angleConverters.d
        if (trip.backIncType && trip.backIncType[0].toUpperCase() === 'C') {
          convIncBs = flowRight(function (a) {
            return -a
          }, convIncBs)
        }

        datout.write(formatTrip(cave, trip))

        return trip
      })
      // parser.plugin('comment', function ({text: _comment}) {
      //   if (comment) {
      //     comment += '\t' + _comment
      //   }
      //   else {
      //     comment = _comment
      //   }
      //   return _comment
      // })
      parser.plugin('shot', function (shot) {
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

        datout.write(cols.join(' ') + '\r\n')
        comment = undefined
        return shot
      })
      parser.plugin('afterRawSurveyFile', function (file) {
        datout.end()
        if (project) {
          fs.closeSync(fd)
          process.stderr.write('done.\n')
        }
      })
    })

    program.plugin('afterParse', function () {
      if (datout) {
        datout.end()
        console.error(`wrote ${datfile}`)
      }
      allmakout.end()
      console.error(`wrote ${allmakfile}`)
      chipallmakout.end()
      console.error(`wrote ${chipallmakfile}`)
    })
  }
}
