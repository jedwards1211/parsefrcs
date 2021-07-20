import Tapable from 'tapable'
import Getopt from 'node-getopt'

export default class ParseProgram extends Tapable {
  constructor(options = {}) {
    super()
    this.options = options
    this.resources = {}
    if (!options.getopt) {
      options.getopt = {}
    }
    if (!options.getopt.options) {
      options.getopt.options = []
    }
    options.getopt.options.push(['h', 'help', 'display this help'])
  }

  run() {
    var options = this.options

    this.applyPlugins('configureGetopt', options.getopt)

    var getopt = new Getopt(options.getopt.options)
    if (options.getopt.help) {
      getopt.setHelp(options.getopt.help)
    }

    var opt = (this.opt = getopt.bindHelp().parseSystem())

    if (!opt.argv.length) {
      getopt.showHelp()
      return
    }

    this.applyPlugins('gotopt', opt)
    this.applyPlugins('run')
    this.applyPlugins('beforeExit')
    this.applyPlugins('exit')
  }

  getResources(dir) {
    return {}
  }
}
