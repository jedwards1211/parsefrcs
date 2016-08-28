
export default class WallsOutputGetoptPlugin {
  constructor(options = {}) {
    this.options = options || {}
  }

  apply(program) {
    var options = this.options

    program.plugin('configureGetopt', function (getopt) {
      getopt.options.push(
        ['', 'wpj=NAME', 'create a Walls project (creates NAME/NAME.wpj and NAME/#.srv for each trip)'],
        ['', 'walls-units=OPTS', 'append OPTS to every Walls #units directive']
      )
    })

    program.plugin('gotopt', function (opt) {
      if (opt.options.wpj || !options.requireWpjOption) {
        var WallsOutputPlugin = require('./WallsOutputPlugin').default
        program.apply(new WallsOutputPlugin({
          project: opt.options.wpj,
          extraUnits: opt.options['walls-units'],
        }))
      }
    })
  }
}
