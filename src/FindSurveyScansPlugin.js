var fs = require('fs')
var path = require('path')

function FindSurveyScansPlugin(options) {
  this.options = options || {}
}

FindSurveyScansPlugin.prototype.apply = function (program) {
  var surveyScanDir = this.options.surveyScanDir || 'SurveyScans'
  var fileNamePattern = this.options.fileNamePattern || /\D*(\d+).*\.pdf$/i

  program.plugin('parser', function (parser) {
    var scans
    parser.plugin('beforeSummaryFile', function (file) {
      scans = []
      var resources = program.getResources(path.dirname(file))

      var scanDir = resources.surveyScanDir || surveyScanDir
      if (!path.isAbsolute(scanDir)) {
        scanDir = path.join(path.dirname(file), scanDir)
      }
      var _fileNamePattern = resources.fileNamePattern ?
        new RegExp(resources.fileNamePattern) :
        fileNamePattern

      if (fs.existsSync(scanDir) && fs.statSync(scanDir).isDirectory()) {
        fs.readdirSync(scanDir).forEach(function (file) {
          var match = _fileNamePattern.exec(file)
          if (match) {
            scans[parseInt(match[1])] = path.join(scanDir, file)
          }
        })
      }
    })
    parser.plugin('tripSummary', function (summary) {
      if (scans && scans.hasOwnProperty(summary.tripNum)) {
        summary.surveyScan = scans[summary.tripNum]
      }
      return summary
    })
  })
}

module.exports = FindSurveyScansPlugin
