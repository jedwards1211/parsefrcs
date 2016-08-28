'use strict'

function PrintFilesFoundPlugin() {
}

PrintFilesFoundPlugin.prototype.apply = function (program) {
  program.plugin('configureGetopt', function (getopt) {
    getopt.options.push(
      ['', 'print-input-files', 'print input data files that were found and exit']
    )
  })

  var opt

  program.plugin('gotopt', function (_opt) {
    opt = _opt
  })
  program.plugin('foundFrcsFiles', function (files) {
    if (opt.options['print-input-files']) {
      for (var key in files) {
        if (files.hasOwnProperty(key)) {
          console.log(key + ':\n' +
            files[key].map(function (file) {
              return "  " + file
            }).join('\n'))
        }
      }
      process.exit(0)
    }
  })
}

module.exports = PrintFilesFoundPlugin
