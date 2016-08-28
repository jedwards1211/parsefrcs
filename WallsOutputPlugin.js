'use strict';

var fs = require('fs');
var path = require('path');
var normalizeTripName = require('./normalizeTripName');

function optionalNum(n) {
  return isNaN(n) || n === null ? '--' : String(n);
}

function anglePair(fs, bs) {
  if (isNaN(fs)) fs = undefined;
  if (isNaN(bs)) bs = undefined;
  if (bs !== undefined) {
    return optionalNum(fs) + '/' + String(bs);
  }
  return optionalNum(fs);
}

function anyValid(args) {
  for (var i = 0; i < arguments.length; i++) {
    if (!isNaN(arguments[i]) && arguments[i] !== null) {
      return true;
    }
  }
}

function WallsOutputPlugin(options) {
  this.options = options || {};
}

WallsOutputPlugin.prototype.apply = function(program) {
  var project = this.options.project;
  var extraUnits = this.options.extraUnits;

  var currentDir;
  var frcsFiles;
  var multicave = program.multiDirectory;

  var wpj = [
    ';WALLS Project file',
  ];

  program.plugin('beforeParse', function(files) {
    frcsFiles = files;
    if (project && !fs.existsSync(project)) {
      process.stderr.write('Creating directory ' + project + '...');
      fs.mkdirSync(project);
      process.stderr.write('done.\n');
    }
  });

  program.plugin('parser', function(parser) {
    var tripsByName = {};
    var tripCount = 0;
    var fd;
    var out;
    var cave;

    parser.plugin('cave', function(_cave) {
      if (cave !== undefined) {
        wpj.push('.ENDBOOK');
      }
      cave = _cave;
      wpj.push('.BOOK ' + cave.name);
      wpj.push('.NAME ' + cave.name);
      wpj.push('.STATUS 19');
    });

    var fixFileNameMap = {};

    parser.plugin('beforeParseCalculatedSurvey', function() {
      if (project) {
        // map calculated survey files to unique 8 char + .srv filenames
        var usedFixFileNames = {};
        frcsFiles.calculatedSurvey.forEach(function(calculatedFile) {
          var outFile = path.basename(calculatedFile);
          var ext = path.extname(outFile);
          outFile = outFile.substring(0, outFile.length - ext.length);
          if (usedFixFileNames[outFile.toLowerCase()]) {
            var num = 0;
            var newName;
            do {
              num++;
              newName = outFile.substring(0, 8 - Math.floor(Math.log(num) / Math.log(10)) - 2) +
                      '~' + num;
            } while (usedFixFileNames[newName.toLowerCase()]);
            outFile = newName;
          }
          usedFixFileNames[outFile.toLowerCase()] = true;
          fixFileNameMap[calculatedFile] = outFile + '.srv';
        });
      }
    });

    parser.plugin('beforeCalculatedSurveyFile', function(file) {
      out = process.stdout.write.bind(process.stdout);

      if (project) {
        var outFile = path.join(project, fixFileNameMap[file]);
        process.stderr.write('Writing ' + outFile + '...');
        fd = fs.openSync(outFile, "w");
        out = function(data) { fs.writeSync(fd, data); };

        out(';');
        out(path.basename(file));
        out('\r\n\r\n');
      }
      out('#units reset f order=enu ');
      if (extraUnits) out(extraUnits);
      out('\r\n');
      if (multicave) {
        out('#prefix ' + path.basename(currentDir) + '\r\n');
      }
      out('\r\n');
    });
    parser.plugin('calculatedShot', function(shot) {
      out([
        '#fix',
        shot.toName,
        shot.x,
        shot.y,
        shot.z,
        '\r\n',
      ].join('\t'));
      return shot;
    });
    parser.plugin('afterCalculatedSurveyFile', function(file) {
      if (project) {
        fs.closeSync(fd);
        process.stderr.write('done.\r\n');
      }
    });

    parser.plugin('beforeRawSurveyFile', function(file) {
      currentDir = path.dirname(file);
      out = process.stdout.write.bind(process.stdout);
    });
    parser.plugin('trip', function(trip) {
      tripCount++;
      if (project) {
        if (fd) fs.closeSync(fd);
        if (tripCount > 1) {
          process.stderr.write('done.\n');
        }

        var tripFileBase;
        var tripFile;
        if (trip.tripNum) tripFileBase = trip.tripNum;
        else tripFileBase = '_' + tripCount;
        if (multicave) tripFileBase = path.basename(currentDir) + tripFileBase;
        tripFile = path.join(project, tripFileBase + '.srv');

        process.stderr.write('Writing ' + tripFile + '...');
        fd = fs.openSync(tripFile, "w");
        out = function(data) { fs.writeSync(fd, data); };

        wpj.push('.SURVEY ' + (trip.tripNum ? String(trip.tripNum) + ': ' : '') +
          trip.name);
        wpj.push('.NAME ' + tripFileBase);
        if (trip.distUnit.charAt(0) === 'F') {
          wpj.push('.STATUS 24');
        }
      }
      else {
        out('\r\n');
      }
      out(';');
      if (trip.tripNum) {
        out(String(trip.tripNum) + ': ');
      }
      out(trip.name + '\r\n');
      if (trip.surveyors) {
        out(';' + trip.surveyors.join('; ') + '\r\n');
      }
      if (trip.date) {
        out('#date ' + trip.date.toISOString().substring(0, 10) + '\r\n');
      }
      var units = [
        '#units',
        'reset',
        'order=dav',
        'lrud=tb',
        trip.distUnit.charAt(0),
        'a=' + trip.azmUnit,
        'ab=' + trip.azmUnit,
        'v=' + trip.incUnit,
        'vb=' + trip.incUnit,
        'typeab=' + (trip.backAzmType === 'C' ? 'C' : 'N') + ',2',
        'typevb=' + (trip.backIncType === 'C' ? 'C' : 'N') + ',2',
      ];
      if (extraUnits) {
        units.push(extraUnits);
      }
      out(units.join(' ') + '\r\n');
      if (multicave) {
        out('#prefix ' + path.basename(currentDir) + '\r\n');
      }
      out('\r\n');
    });
    parser.plugin('comment', function(comment) {
      out(';' + comment + '\r\n');
    });
    parser.plugin('shot', function(shot) {
      var cols = [
        shot.from,
        shot.to,
        shot.distInches ?
          Math.floor(shot.dist) + 'i' + shot.distInches :
          shot.dist,
        shot.dist === 0 ?
          '0' :
          anglePair(shot.azmFs, shot.azmBs),
      ];
      if (shot.dist === 0) {
        cols.push('0');
      }
      else {
        if (shot.flag === 'D' || shot.flag === 'H') {
          cols.push('0', '--', shot.vertDist);
        }
        else {
          cols.push(anglePair(shot.incFs, shot.incBs));
        }
      }
      if (anyValid(shot.l, shot.r, shot.u, shot.d)) {
        cols.push('<' + [
          optionalNum(shot.l),
          optionalNum(shot.r),
          optionalNum(shot.u),
          optionalNum(shot.d),
        ].join(',') + '>');
      }
      out(cols.join('\t') + '\r\n');
    });
    parser.plugin('afterRawSurveyFile', function(file) {
      if (project) {
        fs.closeSync(fd);
        process.stderr.write('done.\n');
      }
    });
  });

  program.plugin('afterParse', function() {
    if (project) {
      wpj.push('.ENDBOOK');
      fs.writeFileSync(path.join(project, project + '.wpj'), wpj.join('\r\n'));
    }
  });
};

module.exports = WallsOutputPlugin;
