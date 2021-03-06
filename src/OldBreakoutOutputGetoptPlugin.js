import OldBreakoutOutputPlugin from './OldBreakoutOutputPlugin'

export default class OldBreakoutOutputGetoptPlugin {
  apply(program) {
    program.plugin('configureGetopt', function (getopt) {
      getopt.options.push(
        ['', 'filename-only-survey-scans', 'use filenames of survey scans only']
      )
    })

    program.plugin('gotopt', function (opt) {
      program.apply(new OldBreakoutOutputPlugin({
        basenameOnlySurveyScans: opt.options['filename-only-survey-scans']
      }))
    })
  }
}
