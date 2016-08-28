'use strict'

var IncludeCalculatedPlugin = require('./IncludeCalculatedPlugin')

function IncludeCalculatedGetoptPlugin() {
}

IncludeCalculatedGetoptPlugin.prototype.apply = function (program) {
  program.plugin('configureGetopt', function (getopt) {
    getopt.options.push(
      ['c', 'include-calculated', 'parse calculated station positions']
    )
  })

  program.plugin('gotopt', function (opt) {
    if (opt.options['include-calculated']) {
      program.apply(new IncludeCalculatedPlugin())
    }
  })
}

module.exports = IncludeCalculatedGetoptPlugin
