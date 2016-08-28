'use strict'

var fs = require('fs')
var path = require('path')
var _ = require('lodash')

function ResourceFilePlugin(options) {
  this.options = options || {}
}

ResourceFilePlugin.prototype.apply = function (program) {
  var resourceFileName = this.options.resourceFileName || '.parsefrcsrc'
  var externalResourceFile = this.options.externalResourceFile

  var externalResources

  if (externalResourceFile) {
    try {
      externalResources = JSON.parse(fs.readFileSync(externalResourceFile, 'utf8')) || {}
    } catch (e) {
      console.error('invalid JSON syntax in resource file: ' + resourceFile)
      console.error(e)
    }
  }

  program.getResources = function (dir) {
    if (!path.isAbsolute(dir)) {
      dir = path.join(process.env.PWD, dir)
    }

    var resources = this.resources[dir]

    if (!resources) {
      this.resources[dir] = resources = {}
      for (var extDir in externalResources) {
        var normExtDir = extDir
        if (!path.isAbsolute(extDir)) normExtDir = path.join(path.dirname(externalResourceFile), extDir)
        if (path.normalize(dir).startsWith(path.normalize(normExtDir))) _.assign(resources, externalResources[extDir])
      }

      var resourceFile = path.join(dir, resourceFileName)
      if (fs.existsSync(resourceFile) && fs.statSync(resourceFile).isFile()) {
        try {
          _.assign(resources, JSON.parse(fs.readFileSync(resourceFile, 'utf8')))
        }
        catch (e) {
          console.error('invalid JSON syntax in resource file: ' + resourceFile)
          console.error(e)
        }
      }
    }
    return resources
  }
}

module.exports = ResourceFilePlugin
