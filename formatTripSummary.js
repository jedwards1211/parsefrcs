var utils = require('./utils');
var setw = utils.setw;
var repeat = utils.repeat;

var _80 = utils.repeat(' ', 80);
var _31 = utils.repeat(' ', 31);
var _33 = utils.repeat(' ', 33);

// given a JSON trip summary like those returned by
// parseTripSummaries(), output original FRCS fixed-width format
module.exports = function formatTripSummary(summary) {
  var s = setw(summary.tripNum, 3) + '  ' +
    setw(summary.date.getMonth() + 1, 2) + '/' +
    setw(summary.date.getDate(), 2) + '/' +
    setw(summary.date.getYear(), 2) + '  ' +
    setw((summary.footage || 0).toFixed(2), 8) + '  ' +
    setw((summary.numShots || 0), 3) + '   ' +
    (summary.name + _80).substring(0, 80) + 
    'EXCLUDED: ' + setw((summary.excludedFootage || 0).toFixed(2), 6) + ' ' +
    setw((summary.numExcludedShots || 0), 2) + '\n' +
    _31 +
    (summary.surveyors || []).join('  ') + '\n';

  if (summary.shots) {
    for (var i = 0; i < summary.shots.length; i += 4) {
      s += _33 +
        summary.shots.slice(i, i + 4).map(function(shot) {
          return (shot + '               ').substring(0, 12);
        }).join(' ') + '\n';
    }
  }

  return s;
};
