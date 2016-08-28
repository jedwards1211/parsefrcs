'use strict'

var findFrcsFiles = require('./findFrcsFiles')

function FindFrcsFilesPlugin() {
}

FindFrcsFilesPlugin.prototype.apply = function (program) {
  program.plugin('run', function () {
    var files = program.frcsFiles = {
      rawSurvey: [],
      tripSummaries: [],
      calculatedSurvey: [],
    }

    program.opt.argv.forEach(function (file) {
      findFrcsFiles(file, files)
    })

    program.applyPlugins('foundFrcsFiles', program.frcsFiles)
  })
}

module.exports = FindFrcsFilesPlugin
