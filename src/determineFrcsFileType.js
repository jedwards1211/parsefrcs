import lineReader from 'line-reader'
import {rawHeaderRegex} from './regexes'
import {parseCalculatedShot} from './parseCalculatedSurvey'
import {parseFirstLineOfSummary} from './parseTripSummaries'

/**
 * @param {String} file - a path to a file
 * @returns {Promise} that will be resolved with the file type
 *           "rawSurvey" or "tripSummaries" or "calculatedSurvey"
 *           or rejected if the file couldn't be identified
 */
export default function (file) {
  var type, linecount
  lineReader.eachLineSync(file, function (line, last) {
    if (++linecount === 1000) {
      return false
    }
    if (line.match(rawHeaderRegex)) {
      type = 'rawSurvey'
      return false
    }
    else if (parseFirstLineOfSummary(line)) {
      type = 'tripSummaries'
      return false
    }
    else if (parseCalculatedShot(line)) {
      type = 'calculatedSurvey'
      return false
    }
  })
  return type
}
