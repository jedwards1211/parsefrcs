'use strict';

var path = require('path');

var FrcsParser = require('./FrcsParser');

function StandardParsePlugin() {
}

StandardParsePlugin.prototype.apply = function(program) {
  program.plugin('foundFrcsFiles', function(files) {
    var rawFiles = files.rawSurvey;
    var summaryFiles = files.tripSummaries;
    var calculatedSurvey = files.calculatedSurvey;

    if (!rawFiles.length && !summaryFiles.length && !calculatedSurvey.length) {
      console.error('Failed to find any frcs files among the provided files/directories.');
      process.exit(1); 
    }

    var groups = {};
    for (var fileType in files) {
      files[fileType].forEach(function(file) {
        var dir = path.dirname(file);
        var group = groups[dir];
        if (!group) group = groups[dir] = {};
        if (!group[fileType]) {
          group[fileType] = [file];
        }
        else {
          group[fileType].push(file);
        }
      });
    }

    program.applyPlugins('beforeParse', files);

    for (var dir in groups) {
      var parser = new FrcsParser(groups[dir]);
      program.applyPlugins('parser', parser);

      parser.parseTripSummaries();
      parser.parseRawSurvey();
    }

    program.applyPlugins('afterParse', files);
  });
};

module.exports = StandardParsePlugin;
