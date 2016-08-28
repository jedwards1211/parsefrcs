'use strict'

var OffsetCalculatedPlugin = require('./OffsetCalculatedPlugin')

function OffsetCalculatedGetoptPlugin() {
}

OffsetCalculatedGetoptPlugin.prototype.apply = function (program) {
  program.plugin('configureGetopt', function (getopt) {
    getopt.options.push(
      ['', 'east-offs=OFFS', 'offset calculated east by OFFS'],
      ['', 'north-offs=OFFS', 'offset calculated north by OFFS'],
      ['', 'up-offs=OFFS', 'offset calculated up by OFFS']
    )
  })

  program.plugin('gotopt', function (opt) {
    program.apply(new OffsetCalculatedPlugin({
      eastOffset: Number(opt.options['east-offs'] || 0),
      northOffset: Number(opt.options['north-offs'] || 0),
      upOffset: Number(opt.options['up-offs'] || 0),
    }))
  })
}

module.exports = OffsetCalculatedGetoptPlugin
