import {tripSummaryRegex} from './regexes'

var tripStart = /^ {2}\d | {1}\d{2} |\d{3} |\d{4} /

export function parseFirstLineOfSummary(line) {
  const match = tripSummaryRegex.exec(line)

  if (match) {
    let year = parseInt(match[4])
    if (year < 1000) year += 1900
    return {
      tripNum: parseInt(match[1]),
      date: new Date(
        year,
        parseInt(match[2]) - 1,
        parseInt(match[3]),
      ),
      footage: parseFloat(match[5]),
      numShots: parseInt(match[6]),
      name: match[7].trim(),
      excludedFootage: parseFloat(match[8]),
      numExcludedShots: parseInt(match[9]),
    }
  }
  return null
}

/**
 * Parses data from a STAT_sum.txt file.  Here is an excerpt of the format:
<pre>  1   2/15/81    258.60   17   ENTRANCE DROPS, JOE'S "I LOVE MY WIFE TRAVERSE", TRICKY TRAVERSE                EXCLUDED:   0.00  0
                               Peter Quick  Keith Ortiz
                                 A1           AD1-AD3      AE1          AE1 SIDE
                                 AE9 SIDE     AE10-AE9     AE13 SIDE    AE15 SIDE
                                 AE20-AE11

  3   3/ 6/81   2371.20   61   DOUG'S DEMISE (50 FT DROP), CHRIS CROSS, CRAWL ABOVE DROP                       EXCLUDED:   0.00  0
                               Peter Quick  Chris Gerace  Phil Oden  Chip Hopper
                                 A13 SIDE     B1-B5        B2 SIDE      B3 SIDE
                                 B6-B18       B17 SIDE     B19-B38      B32 SIDE
                                 BS1-BS5      C1-C18       </pre>
 *
 * @param{lines} an array of strings representing lines of the file to parse.
 * @returns a array with the following format (ex. parsed from above).
 * array[3] gets the data for trip 3 (not trip 4 as programmers might expect :).
 * Note that there are null values at indices 0 and 2 because there are no trips
 * numbered 0 or 2 in the example above.  Also the date fields will be date
 * objects, below is the JSON.stringify()ed version.
<pre>[
null,
{
  "tripNum": 1,
  "date": "1981-02-15T06:00:00.000Z",
  "footage": 258.6,
  "numShots": 17,
  "name": "ENTRANCE DROPS, JOE'S \"I LOVE MY WIFE TRAVERSE\", TRICKY TRAVERSE",
  "excludedFootage": 0,
  "numExcludedShots": 0,
  "surveyors": [
    "Peter Quick",
    "Keith Ortiz"
  ],
  "shots": [
    "A1",
    "AD1-AD3",
    "AE1",
    "AE1 SIDE",
    "AE9 SIDE",
    "AE10-AE9",
    "AE13 SIDE",
    "AE15 SIDE",
    "AE20-AE11"
  ]
},
null,
{
  "tripNum": 3,
  "date": "1981-03-06T06:00:00.000Z",
  "footage": 2371.2,
  "numShots": 61,
  "name": "DOUG'S DEMISE (50 FT DROP), CHRIS CROSS, CRAWL ABOVE DROP",
  "excludedFootage": 0,
  "numExcludedShots": 0,
  "surveyors": [
    "Peter Quick",
    "Chris Gerace",
    "Phil Oden",
    "Chip Hopper"
  ],
  "shots": [
    "A13 SIDE",
    "B1-B5",
    "B2 SIDE",
    "B3 SIDE",
    "B6-B18",
    "B17 SIDE",
    "B19-B38",
    "B32 SIDE",
    "BS1-BS5",
    "C1-C18"
  ]
}
]</pre>
 */
export default function (lines) {
  if (typeof lines === 'string') lines = lines.split(/\r\n|\n\r|\r|\n/)

  var result = []

  var i = 0

  function parseTrip() {
    var trip = parseFirstLineOfSummary(lines[i])

    if (trip) {
      trip.surveyors = lines[++i].trim().split(/ {2}/)
      trip.shots = []

      while (i < lines.length - 1 && !tripStart.test(lines[++i])) {
        var trimmed = lines[i].trim()
        if (trimmed.length) {
          Array.prototype.push.apply(trip.shots, trimmed.split(/\s\s+|\t+/))
        }
      }
    }
    return trip
  }

  while (i < lines.length) {
    var trip = parseTrip()
    if (trip) result[trip.tripNum] = trip
    else i++
  }

  return result
}
