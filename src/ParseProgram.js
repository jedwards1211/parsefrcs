import fs from 'fs'
import path from 'path'
import Tapable from 'tapable'
import Getopt from 'node-getopt'
import findFrcsFiles from './findFrcsFiles'

function ParseProgram(options) {
  Tapable.call(this)
  this.options = options
  this.resources = {}
  if (!options.getopt) {
    options.getopt = {}
  }
  if (!options.getopt.options) {
    options.getopt.options = []
  }
  options.getopt.options.push(
    ['h', 'help', 'display this help']
  )
}

ParseProgram.prototype = Object.create(Tapable.prototype)

ParseProgram.prototype.run = function () {
  var options = this.options

  this.applyPlugins('configureGetopt', options.getopt)

  var getopt = new Getopt(options.getopt.options)
  if (options.getopt.help) {
    getopt.setHelp(options.getopt.help)
  }

  var opt = this.opt = getopt.bindHelp().parseSystem()

  if (!opt.argv.length) {
    getopt.showHelp()
    return
  }

  this.applyPlugins('gotopt', opt)

  this.applyPlugins('run')
}

ParseProgram.prototype.getResources = function (dir) {
  return {}
}

export default ParseProgram
