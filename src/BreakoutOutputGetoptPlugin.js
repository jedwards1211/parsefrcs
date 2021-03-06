// @flow

import type {Tapable} from 'tapable'
import BreakoutOutputPlugin from './BreakoutOutputPlugin'

export default class BreakoutOutputGetoptPlugin {
  apply(program: Tapable) {
    program.plugin('configureGetopt', function (getopt: {options: Array<Array<string>>}) {
      getopt.options.push(
        ['', 'filename-only-survey-scans', 'use filenames of survey scans only'],
        ['', 'pretty', 'pretty-print json'],
      )
    })

    program.plugin('gotopt', function (opt: {options: {[name: string]: any}}) {
      program.apply(new BreakoutOutputPlugin({
        basenameOnlySurveyScans: opt.options['filename-only-survey-scans'],
        pretty: opt.options.pretty,
      }))
    })
  }
}
