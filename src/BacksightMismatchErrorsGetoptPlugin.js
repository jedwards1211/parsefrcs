import BacksightMismatchErrorsPlugin from './BacksightMismatchErrorsPlugin'

const DEFAULT_WARN_DIFF = 2
const DEFAULT_ERROR_DIFF = 10

export default class CheckBacksightsGetoptPlugin {
  apply(program) {
    program.plugin('configureGetopt', function (getopt) {
      getopt.options.push(
        ['', 'warn-bs-diff=DEGREES', `warn if backsights disagree by more than DEGREES (default: ${DEFAULT_WARN_DIFF}°)`],
        ['', 'error-bs-diff=DEGREES', `error if backsights disagree by more than DEGREES (default: ${DEFAULT_ERROR_DIFF}°)`]
      )
    })

    program.plugin('gotopt', function (opt) {
      program.apply(new BacksightMismatchErrorsPlugin({
        warnDiff: Number(opt.options['warn-bs-diff']) || DEFAULT_WARN_DIFF,
        errorDiff: Number(opt.options['error-bs-diff']) || DEFAULT_ERROR_DIFF,
      }))
    })
  }
}
