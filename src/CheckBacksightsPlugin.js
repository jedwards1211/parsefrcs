import {identity, flowRight} from 'lodash'
import {oppositeDeg, gradToDeg, milToDeg} from './utils'

const angleConverters = {
  'd': identity,
  'D': identity,
  'g': gradToDeg,
  'G': gradToDeg,
  'm': milToDeg,
  'M': milToDeg,
}

export default class CheckBacksightsPlugin {
  constructor(options = {}) {
    this.options = options
  }
  
  apply(program) {
    const warnDiff = this.options.warnDiff || 2
    const errorDiff = this.options.errorDiff || 10
    program.plugin('parser', parser => {
      let currentTrip
      let convAzmFs, convAzmBs, convIncFs, convIncBs
      
      parser.plugin('trip', trip => {
        currentTrip = trip

        convAzmFs = convAzmBs = angleConverters[trip.azmUnit] || angleConverters.d
        if (!trip.azmCorrected) convAzmBs = flowRight(oppositeDeg, convAzmBs)
        
        convIncFs = convIncBs = angleConverters[trip.incUnit] || angleConverters.d
        if (!trip.incCorrected) convIncBs = flowRight(a => -a, convIncBs)
        
        return trip
      })
      parser.plugin('shot', shot => {
        if (Number.isFinite(shot.azmFs) && Number.isFinite(shot.azmBs)) {
          const diff = Math.abs(convAzmFs(shot.azmFs) - convAzmBs(shot.azmBs))
          if (diff > warnDiff) {
            const {file, line, text} = shot
            parser.applyPluginsWaterfall('error', {
              severity: diff > errorDiff ? 'error' : 'warning',
              file,
              line,
              text,
              startColumn: 19,
              endColumn: 30,
              message: `Frontsight and ${currentTrip.azmCorrected ? '' : 'un'}corrected backsight azimuth differ by ${diff.toFixed(1)}°`
            })
          } 
        }
        if (Number.isFinite(shot.incFs) && Number.isFinite(shot.incBs)) {
          const diff = Math.abs(convIncFs(shot.incFs) - convIncBs(shot.incBs))
          if (diff > warnDiff) {
            const {file, line, text} = shot
            parser.applyPluginsWaterfall('error', {
              severity: diff > errorDiff ? 'error' : 'warning',
              file,
              file,
              line,
              text,
              startColumn: 30,
              endColumn: 40,
              message: `Frontsight and ${currentTrip.incCorrected ? '' : 'un'}corrected backsight inclination differ by ${diff.toFixed(1)}°`
            })
          }
        }
        return shot
      })
    })
  }
}