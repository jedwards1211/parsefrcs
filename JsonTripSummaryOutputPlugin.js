var formatTripSummary = require('./formatTripSummary');

function JsonTripSummaryOutputPlugin(options) {
  this.options = options;
}

JsonTripSummaryOutputPlugin.prototype.apply = function(program) {
  var out = process.stdout.write.bind(process.stdout);

  program.plugin('parser', function(parser) {
    parser.plugin('tripSummary', function(summary) {
      out(JSON.stringify(summary, null, "  ") + '\n');
      return summary;
    });
  })
};

module.exports = JsonTripSummaryOutputPlugin;
