import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import untildify from 'untildify'
import JSON5 from 'json5'

export default class ResourceFilePlugin {
  constructor(options = {}) {
    this.options = options || {}
  }

  apply(program) {
    var resourceFileName = this.options.resourceFileName
    var externalResourceFile =
      this.options.externalResourceFile &&
      path.normalize(path.resolve(untildify(this.options.externalResourceFile)))

    var externalResources

    if (externalResourceFile) {
      try {
        externalResources = _.mapKeys(
          JSON5.parse(fs.readFileSync(externalResourceFile, 'utf8')) || {},
          (value, dir) => path.normalize(path.resolve(untildify(dir)))
        )
      } catch (e) {
        console.error(
          'invalid JSON syntax in resource file: ' + externalResourceFile
        )
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
          if (path.normalize(dir).startsWith(extDir))
            _.assign(resources, externalResources[extDir])
        }

        if (resourceFileName) {
          var resourceFile = path.join(dir, resourceFileName)
          if (
            fs.existsSync(resourceFile) &&
            fs.statSync(resourceFile).isFile()
          ) {
            try {
              _.assign(
                resources,
                JSON5.parse(fs.readFileSync(resourceFile, 'utf8'))
              )
            } catch (e) {
              console.error(
                'invalid JSON syntax in resource file: ' + resourceFile
              )
              console.error(e)
            }
          }
        }
      }
      return resources
    }
  }
}
