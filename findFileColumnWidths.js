var utils = require('./utils');
var lineReader = require('line-reader');

// returns the most common fixed column widths in the file.
// Some FRCS files have occasional irregularities when a field is
// wider than expected for the column :)
function findFileColumnWidths(file, expectedNumColumns) {
  var counts = {};

  lineReader.eachLineSync(file, function(line) {
    var widths = utils.findColumnWidths(line);
    if (!expectedNumColumns || widths.length === expectedNumColumns) {
      var key = widths.join(',');
      counts[key] = (counts[key] || 0) + 1;
    }
  });

  var bestKey;
  for (var key in counts) {
    if (counts.hasOwnProperty(key)) {
      if (!bestKey || counts[key] > counts[bestKey]) {
        bestKey = key;
      }
    }
  }
  return bestKey.split(',');
}

module.exports = findFileColumnWidths;

if (!module.parent) {
  console.log(findFileColumnWidths(process.argv[2], parseInt(process.argv[3])));
}
