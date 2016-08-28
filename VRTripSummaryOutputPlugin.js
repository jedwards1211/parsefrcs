var formatTripSummary = require('./formatTripSummary');

function VRTripSummaryOutputPlugin() {}

// generates trip summaries from the trip comments in raw survey
// data with a format like I found in Chip's cdata.vr
VRTripSummaryOutputPlugin.prototype.apply = function(program) {
  program.plugin('parser', function(parser) {
    var summary;

    parser.plugin('trip', function(trip) {
      var lines = trip.comment.split('\n');
      var dotIndex = lines[1].lastIndexOf('.') || lines[1].length;
      if (summary) {
        console.log(formatTripSummary(summary));
      }
      summary = {
        name: lines[0].trim(),
        surveyors: lines[1].substring(0, dotIndex)
          .trim().split(/\s*,\s*/),
        date: new Date(lines[1].substring(dotIndex + 1).trim()),
        section: lines[2].trim(),
        tripNum: parseInt(lines[3].substring(3, 7).trim()),
        footage: 0,
        numShots: 0,
        excludedFootage: 0,
        numExcludedShots: 0,
      };
      return trip;
    });

    parser.plugin('shot', function(shot) {
      if (summary) {
        summary.footage += shot.dist;
        summary.numShots++;
        if (shot.exclude) {
          summary.excludedFootage += shot.dist;
          summary.numExcludedShots++;
        }
      }
      return shot;
    });

    parser.plugin('afterParseRawSurvey', function() {
      if (summary) {
        console.log(formatTripSummary(summary));
        summary = undefined ;
      }
    });
  });
};

module.exports = VRTripSummaryOutputPlugin;
