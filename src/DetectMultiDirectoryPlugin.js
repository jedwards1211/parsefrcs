import path from 'path'

export default class DetectMultiDirectoryPlugin {
  apply(program) {
    program.plugin('beforeParse', function (files) {
      var dir
      for (var fileType in files) {
        for (var i = 0; i < files[fileType].length; i++) {
          var filedir = path.dirname(files[fileType][i])
          if (!dir) {
            dir = filedir
          }
          else if (dir !== filedir) {
            program.multiDirectory = true
            return
          }
        }
      }
    })
  }
}
