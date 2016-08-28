export default class IncludeCalculatedPlugin {
  apply(program) {
    program.plugin('parser', function (parser) {
      parser.plugin('beforeParseRawSurvey', function () {
        parser.parseCalculatedSurvey()
      })
    })
  }
}
