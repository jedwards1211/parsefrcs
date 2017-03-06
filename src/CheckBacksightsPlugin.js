import {identity, flowRight} from 'lodash'
import {oppositeDeg, gradToDeg, milToDeg, azmDiff} from './utils'

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
        const incFs = convIncFs(shot.incFs)
        const incBs = convIncBs(shot.incBs)
        if (Number.isFinite(incFs) && Number.isFinite(incBs)) {
          const diff = Math.abs(incFs - incBs)
          if (diff > warnDiff) {
            const {file, line, text} = shot
            parser.error({
              severity: diff > errorDiff ? 'error' : 'warning',
              file,
              line,
              text,
              startColumn: 30,
              endColumn: 40,
              type: 'bs-inc-agreement',
              message: `Frontsight and ${currentTrip.incCorrected ? '' : 'un'}corrected backsight inclination differ by ${diff.toFixed(1)}°`
            })
          }
        }
        const isVertical = (Math.abs(incFs) === 90 || Math.abs(incBs) === 90) &&
          (incFs === incBs || (Number.isFinite(incFs) ^ Number.isFinite((incBs))))
        if (!isVertical && Number.isFinite(shot.azmFs) && Number.isFinite(shot.azmBs)) {
          const diff = azmDiff(convAzmFs(shot.azmFs), convAzmBs(shot.azmBs))
          if (diff > warnDiff) {
            const {file, line, text} = shot
            parser.error({
              severity: diff > errorDiff ? 'error' : 'warning',
              file,
              line,
              text,
              startColumn: 19,
              endColumn: 30,
              type: 'bs-azm-agreement',
              message: `Frontsight and ${currentTrip.azmCorrected ? '' : 'un'}corrected backsight azimuth differ by ${diff.toFixed(1)}°`
            })
          }
        }
        return shot
      })
    })
  }
}
