import ResourceFilePlugin from './ResourceFilePlugin'

function ResourceFileGetoptPlugin() {
}

ResourceFileGetoptPlugin.prototype.apply = function (program) {
  program.plugin('configureGetopt', function (getopt) {
    getopt.options.push(
      ['', 'use-rc-files[=FILENAME]', 'use per-directory settings from file FILENAME (default: .parsefrcsrc) in each data directory'],
      ['', 'external-resource-file=FILENAME', 'use per-directory settings from single file FILENAME']
    )
  })

  program.plugin('gotopt', function (opt) {
    var resourceFileName = opt.options['use-rc-files']
    var externalResourceFile = opt.options['external-resource-file']
    if (resourceFileName === '') {
      resourceFileName = '.parsefrcsrc'
    }
    if (resourceFileName || externalResourceFile) {
      program.apply(new ResourceFilePlugin({
        resourceFileName,
        externalResourceFile,
      }))
    }
  })
}

export default ResourceFileGetoptPlugin
