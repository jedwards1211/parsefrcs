export default class JsonTripSummaryOutputPlugin {
  constructor(options = {}) {
    this.options = options
  }

  apply(program) {
    var out = process.stdout.write.bind(process.stdout)

    program.plugin('parser', function (parser) {
      parser.plugin('tripSummary', function (summary) {
        out(JSON.stringify(summary, null, "  ") + '\n')
        return summary
      })
    })
  }
}
