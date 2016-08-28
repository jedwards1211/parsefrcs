'use strict';

var fs = require('fs');
var path = require('path');
var determineFrcsFileType = require('./determineFrcsFileType');

function findFrcsFiles(paths, result, options, depth) {
  if (!result) result = {};
  if (!options) options = {};
  if (!depth) depth = 0;

  if (!options.ignore) {
    options.ignore = /\.(png|jpg|jpeg|gif|pdf|mp3|mp4|avi|ai|psd)$/;
  }

  if (depth > options.maxDepth) {
    return;
  }

  if (paths instanceof Array) {
    for (var i = 0; i < paths.length; i++) {
      findFrcsFiles(paths[i], result, options);
    }
    return;
  }

  var stats;
  try {
    stats = fs.statSync(paths);
  }
  catch (e) {
    console.error(e.message);
    return;
  }
  if (stats.isDirectory()) {
    fs.readdirSync(paths).forEach(function(file) {
      if (!options.ignore.test(file)) {
        findFrcsFiles(path.join(paths, file), result, options, depth + 1);
      }
    });
  }
  else {
    var type = determineFrcsFileType(paths);
    if (type) {
      if (!result[type]) result[type] = [];
      result[type].push(paths);
    }
  }

  return result;
}

module.exports = findFrcsFiles;
