'use strict';

var lineReader = require('line-reader');
var regexes = require('./regexes');
var parseCalculatedShot = require('./parseCalculatedSurvey').parseCalculatedShot;
var parseFirstLineOfSummary = require('./parseTripSummaries').parseFirstLineOfSummary;

/**
 * @param {String} file - a path to a file
 * @returns {Promise} that will be resolved with the file type
 * 					"rawSurvey" or "tripSummaries" or "calculatedSurvey"
 * 					or rejected if the file couldn't be identified
 */
module.exports = function(file) {
	var type, linecount;
	lineReader.eachLineSync(file, function(line, last) {
		if (++linecount === 1000) {
			return false;
		}
		if (line.match(regexes.rawHeaderRegex)) {
			type = 'rawSurvey';
			return false;
		}
		else if (parseFirstLineOfSummary(line)) {
			type ='tripSummaries';
			return false;
		}
		else if (parseCalculatedShot(line)) {
			type = 'calculatedSurvey';
			return false;
		}
	});
	return type;
}
