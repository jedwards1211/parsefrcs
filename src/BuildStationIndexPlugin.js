// @flow

import type {Tapable} from 'tapable'
import type {Shot, TripWithSummary} from './types'

type Cave = {
  stations: {
    [stationName: string]: Array<{
      shot: Shot,
      trip: ?TripWithSummary,
    }>,
  },
}

type Caves = {
  [caveName: string]: Cave,
}

export type StationIndex = {
  caves: Caves,
}

export type Options = {
  callback: (index: StationIndex) => any,
}

export default class BuildStationIndexPlugin {
  constructor(options: Options) {
    this.options = options
  }

  options: Options
  stationIndex: StationIndex = {
    caves: {}
  }
  caves: Caves = this.stationIndex.caves
  currentCave: ?Cave
  currentCaveName: ?string
  currentTrip: ?TripWithSummary

  apply(program: Tapable) {
    program.plugin('afterParse', () => {
      this.options.callback(this.stationIndex)
    })

    program.plugin('parser', (parser: Tapable) => {
      parser.plugin('shot', (shot: Shot) => {
        const {currentCave, currentTrip: trip} = this
        if (currentCave) {
          for (let station of [shot.from, shot.to]) {
            let shots = currentCave.stations[station]
            if (!shots) shots = currentCave.stations[station] = []
            shots.push({shot, trip})
          }
        }
        return shot
      })

      parser.plugin('beforeRawSurveyFile', () => {
        this.currentTrip = undefined
      })
      parser.plugin('trip', (trip: TripWithSummary) => {
        this.currentTrip = trip
        let cave = this.caves[trip.cave.name]
        if (!cave) {
          cave = {stations: {}}
          this.caves[trip.cave.name] = cave
        }
        this.currentCave = cave
        this.currentCaveName = trip.cave.name
        return trip
      })
      parser.plugin('shot', (shot: Shot) => {
        return shot
      })
    })
  }
}
