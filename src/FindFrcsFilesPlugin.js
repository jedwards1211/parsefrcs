import findFrcsFiles from './findFrcsFiles'

export default class FindFrcsFilesPlugin {
  apply(program) {
    program.plugin('run', function () {
      var files = (program.frcsFiles = {
        rawSurvey: [],
        tripSummaries: [],
        calculatedSurvey: [],
      })

      program.opt.argv.forEach(function (file) {
        findFrcsFiles(file, files)
      })

      program.applyPlugins('foundFrcsFiles', program.frcsFiles)
    })
  }
}
