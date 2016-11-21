// @flow

import fs from 'fs'
import path from 'path'

import type {Tapable} from 'tapable'
import type {MetacaveData, Cave, Caves, Trip, Surveyors, Station, Shot, ShotMeasurement} from 'metacave-flow'
import type {TripWithSummary, CalculatedShot} from './types'

const distUnits = {
  'FT': 'ft',
  'FI': 'ft',
  'M ': 'm',
}

const angleUnits = {
  'D': 'deg',
  'G': 'grad',
  'M': 'mil',
}

type Options = {
  file?: string,
  basenameOnlySurveyScans?: boolean,
  pretty?: boolean,
}

function formatLrud(number: number): ?string {
  if (!Number.isFinite(number)) return '0'
  return number.toFixed(2)
}

export default class BreakoutOutputPlugin {
  constructor(options: Options = {}) {
    this.options = options
  }

  options: Options
  root: MetacaveData = {
    caves: {}
  }
  caves: Caves = this.root.caves
  currentCave: ?Cave
  currentCaveName: ?string
  currentTrip: ?Trip

  convertTripHeader(trip: TripWithSummary): Trip {
    const surveyors: Surveyors = {}
    for (let surveyor of trip.surveyors || []) surveyors[surveyor] = {}
    const result = {
      name: trip.name,
      surveyors,
      distUnit: distUnits[trip.distUnit.toUpperCase()],
      angleUnit: 'deg',
      azmFsUnit: angleUnits[trip.azmUnit.toUpperCase()],
      azmBsUnit: angleUnits[trip.azmUnit.toUpperCase()],
      incFsUnit: angleUnits[trip.incUnit.toUpperCase()],
      incBsUnit: angleUnits[trip.incUnit.toUpperCase()],
      azmBacksightsCorrected: trip.azmCorrected,
      incBacksightsCorrected: trip.incCorrected,
      survey: [],
    }
    if (trip.date) (result: Object).date = trip.date.toISOString()
    let surveyScan = trip ? trip.surveyScan : null
    if (surveyScan && this.options.basenameOnlySurveyScans) surveyScan = path.basename(surveyScan)
    if (surveyScan) (result: Object).surveyNotesFile = surveyScan
    return result
  }

  apply(program: Tapable) {
    const {file, pretty} = this.options
    // const {basenameOnlySurveyScans} = this.options

    program.plugin('afterParse', () => {
      const data = pretty ? JSON.stringify(this.root, null, 2) : JSON.stringify(this.root)
      if (file) fs.writeFileSync(file, data, 'utf8')
      else console.log(data)
    })

    program.plugin('parser', (parser) => {
      let stationPositions: {[name: string]: CalculatedShot} = {}
      // let comment: ?string

      parser.plugin('beforeCalculatedSurveyFile', function (file) {
        stationPositions = {}
      })

      parser.plugin('calculatedShot', (shot: CalculatedShot) => {
        stationPositions[shot.toName] = shot
        return shot
      })

      parser.plugin('beforeRawSurveyFile', (file) => {
        this.currentTrip = undefined
      })
      parser.plugin('trip', (trip: TripWithSummary) => {
        this.currentTrip = this.convertTripHeader(trip)
        let cave = this.caves[trip.cave.name]
        if (!cave) {
          cave = {}
          this.caves[trip.cave.name] = cave
        }
        this.currentCave = cave
        this.currentCaveName = trip.cave.name
        const trips = cave.trips || (cave.trips = [])
        trips.push(this.currentTrip)
        return trip
      })
      // parser.plugin('comment', (_comment: string) => {
      //   comment = _comment
      //   return _comment
      // })
      parser.plugin('shot', (shot) => {
        const {currentTrip, currentCave} = this
        if (!currentTrip || !currentCave) return shot

        const survey = currentTrip.survey || (currentTrip.survey = [])

        const lastFromStation: ?Station = (survey[survey.length - 3]: any)
        const lastShot: ?Shot = (survey[survey.length - 2]: any)
        const lastToStation: ?Station = (survey[survey.length - 1]: any)

        let measurements: Array<ShotMeasurement>

        if (lastFromStation && lastShot && lastToStation &&
          shot.from === lastFromStation.station &&
          (!lastFromStation.cave || lastFromStation.cave === this.currentCaveName) &&
          shot.to === lastToStation.station &&
          (!lastToStation.cave || lastToStation.cave === this.currentCaveName)) {
          // same from and to station; prepare to add measurements to the last shot
          measurements = lastShot.measurements || (lastShot.measurements = [])
        } else {
          // if the last station doesn't match the from station of this shot,
          // insert an empty (non) shot and a new from station
          let fromStation: ?Station
          if (lastToStation &&
            (!lastToStation.cave || lastToStation.cave === this.currentCaveName) &&
            lastToStation.station === shot.from) {
            fromStation = lastToStation
          } else if (survey.length) {
            // insert empty shot
            survey.push({})
          }
          if (!fromStation) {
            fromStation = ({
              station: shot.from,
            }: Station)
            survey.push(fromStation)
          }

          let toStation: ?Station

          if (shot.to) {
            // insert shot
            measurements = []
            survey.push(({measurements}: Shot))
            // insert to station
            toStation = ({station: shot.to}: Station)
            survey.push(toStation)

            // add lruds to to station
            if (!toStation.lrud) {
              toStation.lrud = [
                formatLrud(shot.l),
                formatLrud(shot.r),
                formatLrud(shot.u),
                formatLrud(shot.d),
              ]
            }
          } else {
            measurements = (fromStation.splays || (fromStation.splays = []): any)
          }

          // add nev to stations
          for (let station of [fromStation, toStation]) {
            if (!station) continue
            const pos = stationPositions[station.station]
            if (!station.nev && pos) {
              (station: Object).nev = [
                formatLrud(pos.y),
                formatLrud(pos.x),
                formatLrud(pos.z),
              ]
            }
          }
        }

        let {incFs, incBs, azmFs, azmBs} = shot
        if (!Number.isFinite(incFs) || !Number.isFinite(incBs)) {
          if (Number.isFinite(azmFs)) incFs = 0
          else if (Number.isFinite(azmBs)) incBs = 0
        }

        if (measurements) {
          // add frontsights
          const frontsight: ShotMeasurement = {dir: 'fs'}
          if (Number.isFinite(shot.dist)) frontsight.dist = shot.dist.toFixed(2)
          if (Number.isFinite(shot.azmFs)) frontsight.azm = shot.azmFs.toFixed(2)
          if (Number.isFinite(incFs)) frontsight.inc = incFs.toFixed(2)
          measurements.push(frontsight)

          // add backsights
          if (Number.isFinite(shot.azmBs) || Number.isFinite(shot.incBs)) {
            const backsight: ShotMeasurement = {dir: 'bs'}
            if (Number.isFinite(shot.azmBs)) backsight.azm = shot.azmBs.toFixed(2)
            if (Number.isFinite(incBs)) backsight.inc = incBs.toFixed(2)
            measurements.push(backsight)
          }
        }

        return shot
      })
    })
  }
}
