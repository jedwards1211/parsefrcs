import OffsetCalculatedByFilePlugin from './OffsetCalculatedByFilePlugin'

function OffsetCalculatedByFileGetoptPlugin() {
}

OffsetCalculatedByFileGetoptPlugin.prototype.apply = function (program) {
  program.plugin('configureGetopt', function (getopt) {
    getopt.options.push(
      ['', 'rc-offs', 'offset calculated stations according to .parsefrcsrc files']
    )
  })

  program.plugin('gotopt', function (opt) {
    if (opt.options['rc-offs']) {
      program.apply(new OffsetCalculatedByFilePlugin())
    }
  })
}

export default OffsetCalculatedByFileGetoptPlugin
