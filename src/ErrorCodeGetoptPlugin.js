import ErrorCodePlugin from './ErrorCodePlugin'

export default class ErrorCodeGetoptPlugin {
  apply(program) {
    program.plugin('configureGetopt', function (getopt) {
      getopt.options.push(
        ['', 'werror', 'consider warnings as errors']
      )
    })

    program.plugin('gotopt', function (opt) {
      const {werror} = opt.options
      program.apply(new ErrorCodePlugin({werror}))
    })
  }
}
