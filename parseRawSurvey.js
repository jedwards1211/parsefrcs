'use strict';

var rawHeaderRegex = require('./regexes').rawHeaderRegex;

/**
 * Parses a raw cdata.fr survey file.  These look like so:
 *
<pre>      Fisher Ridge Cave System, Hart Co., KY
ENTRANCE DROPS, JOE'S "I LOVE MY WIFE TRAVERSE", TRICKY TRAVERSE
PETER QUICK, KEITH ORTIZ   -  2-15-81
This File has Crumps test connected.  11/20/12
 *
FT C  DD    A
    AE20     0                          1  3  0  2
*      %FS
*     AE20     0        0        0        Bug-can't put before so put after-so can't make 2 fixed 10/28/12
 AE19 AE20   9.3    60.0  60.0-36.0       2 12  0 20
 AE18 AE19  24.5     0.0   0.0-90.0       6 10 25  0
 AE17 AE18   8.0   350.5 350.5 17.0       3  5  0  0
 AE16 AE17   6.7     0.0   0.0-90.0       3  5  6  1
 AE15 AE16  12.6    70.5  71.0-18.0       4  0  2  1
 AE14 AE15  10.0    21.5  20.0  6.0       5  5  0  3
 AE13 AE14  26.8   288.0 286.0-50.0       0  7 20  5
*
*SHORT CANYON AT THE BASE OF THE SECOND DROP
 AE12 AE13  20.7   236.0 236.0 34.0       3  5  4  4
 AE11 AE12  12.4   210.0 210.0 35.0       7  4  5  1
 AE10 AE13  25.7    40.0  40.0 -9.0       2  2  3  6
*
*AE10 AT JOE'S " I LOVE MY WIFE TRAVERSE "
  AE9 AE10  17.8    32.5  31.0 23.0       4  5 20 15
  AE1  AE9  13.7    82.0  82.0-13.0
   A1  AE1  34.3    46.0  48.0-17.5
*
*SURVEY TO DOME NEAR THE ENTRANCE DOME (ABOVE THE SECOND DROP)
  AD1 AE15   8.0   200.0 200.0  0.0       3  1  1  1
  AD2  AD1  17.7   161.0 161.0  7.0       1  4 25  1
  AD3  AD2  10.4   180.0 180.0 50.0       4  1 15  5
 *
TRICKY TRAVERSE AND THEN FIRST SURVEY IN UPPER CROWLWAY
DAN CROWL, KEITH ORTIZ, CHIP HOPPER, PETER QUICK, LARRY BEAN    14 FEB 1981
 *
FI B  DD
   A2   A1  48 10  292.0 110.0-42.0       5 10 35  5
   A3   A2  12  5  333.5 153.5 35.0       3  1 15  5
   A4   A3   4  2    0.0   0.0 90.0       3  1 10 10
...</pre>
 *
 * @param {object}   visitor - the visitor with callback methods for the parser:
 * @param {Function} visitor.acceptTrip - called with a trip object
 *
 * The trip objects will have the following properties:
 * 
 * name: trip name
 * distUnit: "FI" (feet in inches) or "FT" (feet in tenths) or "M" (meters)
 * backAzmType: "B" (uncorrected) or "C" (corrected)
 * backIncType: "B" (uncorrected) or "C" (corrected) or " " (none)
 * azmUnit: "D" (degrees) or "G" (gradians) or "M" (mils)
 * incUnit: "D" (degrees) or "G" (gradians) or "M" (mils)
 * 
 * @param {Function} visitor.acceptComment - called with a line comment
 * @param {Function} visitor.acceptShot - called with a shot object
 * 
 * All backsights will be converted to corrected
 * if necessary, and all horizontal and diagonal shots (marked with an H or D flag
 * right after the distance) will be converted to standard.
 *
 * The shot objects will have the following properties:
 *
 * to: to station name
 * from: from station name
 * dist: distance (including distInches if it is given)
 * distInches: inches part of distance (optional, when inches are given)
 * horizDist: horizontal distance (optional, only for lines with H flag)
 * vertDist: vertical distance (optional, only for lines with H or D flag)
 * flag: "D" (diagonal) or "H" (horizontal) or none
 * azmFs: frontsight azimuth
 * azmBs: backsight azimuth
 * incFs: frontsight inclination
 * incBs: backsight inclination
 * l: left (at to station)
 * r: right (at to station)
 * u: up (at to station)
 * d: down at to station)
 *
 * @returns a callback to which you pass lines of the file one by one.
 */
module.exports = function(emitter) {
  var tripName;
  var inTripComment = true;
  var tripCommentStartLine = 1;
  var tripCommentEndLine = -1;
  var tripComment = [];
  var inBlockComment = false;
  var blockCommentStartLine;
  var section;
  var comment;

  var inches = false;
  var distUnit;
  var backAzmType;
  var backIncType;
  var azmUnit;
  var incUnit;
  var azmCorrected = false;
  var incCorrected = false;
  var hasIncBs = false;

  function append(a, b) {
    return a !== undefined ? a + ' ' + b : b;
  }

  // determines if a cell contains a valid station name.
  function isValidStation(s) {
    return s.match(/^\s*\S+\s*$/);
  }
  // determines if a cell contains a valid unsigned integer.
  function isValidUInt(s) {
    return s.match(/^\s*[0-9]+\s*$/);
  }
  // determines if a cell contains a valid unsigned integer or whitespace.
  function isValidOptUInt(s) {
    return s.match(/^\s*[0-9]*\s*$/);
  }
  // determines if a cell contains a valid unsigned float or whitespace.
  function isValidOptUFloat(s) {
    return s.match(/^\s*[0-9]*(\.[0-9]*)?\s*$/);
  }
  // determines if a cell contains a valid unsigned float.
  function isValidUFloat(s) {
    return s.match(/^\s*([0-9]+(\.[0-9]*)?|\.[0-9]+)\s*$/);
  }
  // determines if a cell contains a valid float or whitespace.
  function isValidOptFloat(s) {
    return s.match(/^\s*-?[0-9]*(\.[0-9]*)?\s*$/);
  }
  // determines if a cell contains a valid inclination or whitespace.
  function isValidOptInclination(s) {
    return s.match(/^\s*[-+]?[0-9]*(\.[0-9]*)?\s*$/);
  }

  var lineCount = 0;

  return function(line) {
    lineCount++; 

    if (lineCount === 1) {
      var match = /^\s*([^,]+)(,(.*))?/.exec(line);
      if (match) {
        var cave = {
          name: match[1].trim(),
        };
        if (match[3]) {
          cave.location = match[3].trim();
        }
        emitter.emit('cave', cave);
      }
    }

    if (line.charAt(0) === ' ' && line.charAt(1) === '*') {

      inTripComment = !inTripComment;
      if (inTripComment) {
        section = undefined;
        tripComment = [];
        tripCommentStartLine = lineCount;
      }
      else {
        tripCommentEndLine = lineCount;
      }

    } else if (inTripComment) {

      if (lineCount > 1) {
        tripComment.push(line);
      }

      if (lineCount === tripCommentStartLine + 1) {
        tripName = line && line.trim();
        comment = undefined;
      }
      var match = /^\*\*\*([^*])\*\*\*/.exec(line);
      if (match) {
        section = match[1].trim();
      }

    } else if (line.charAt(0) === '*') {

      inBlockComment = !inBlockComment;
      if (inBlockComment) {
        blockCommentStartLine = lineCount;
      }
      else if (lineCount === blockCommentStartLine + 1 && line.length > 1) {
        emitter.emit('comment', line.substring(1).trim()); 
      }

    } else if (inBlockComment) {

      emitter.emit('comment', line.trim());

    } else if (lineCount === tripCommentEndLine + 1) {

      var matches = rawHeaderRegex.exec(line);
      distUnit = matches[1];
      backAzmType = matches[2];
      backIncType = matches[3];
      inches = matches[1].charAt(1) === 'I';
      azmCorrected = matches[2].charAt(0) === 'C';
      incCorrected = matches[3].charAt(0) === 'C';
      hasIncBs = matches[3].charAt(0) !== ' ';
      azmUnit = matches[4];
      incUnit = matches[5];

      tripComment = (tripComment || []).join('\n');

      var trip = {
        name: tripName,
        distUnit: distUnit,
        backAzmType: backAzmType,
        backIncType: backIncType,
        azmUnit: azmUnit,
        incUnit: incUnit,
        comment: tripComment,
      };

      if (section) {
        trip.section = section;
      }

      emitter.emit('trip', trip);

    } else {

      // rigorously check the values in all the columns to make sure this 
      // is really a survey shot line, just in case any stray comments are
      // not properly delimited.

      // to station name
      var toStr =            line.substring( 0,  5);
      if (!isValidStation(toStr)) return;

      // from station name
      var fromStr =          line.substring( 5, 10);
      if (!isValidStation(fromStr)) return;

      // distance
      if (inches) {
        var feetStr =        line.substring(10, 14);
        var inchesStr =      line.substring(14, 17);
        // feet and inches are not both optional
        if (!isValidUInt(feetStr) && !isValidUInt(inchesStr)) return;
      } else {
        var feetStr =        line.substring(10, 16);
        // decimal feet are not optional
        if (!isValidUFloat(feetStr)) return;
      }

      // frontsight azimuth
      var azmFsStr =         line.substring(19, 25);
      if (!isValidOptUFloat(azmFsStr)) return;

      // backsight azimuth
      var azmBsStr =         line.substring(25, 30);
      if (!isValidOptUFloat(azmBsStr)) return;

      // frontsight inclination
      var incFsStr =         line.substring(30, 35);
      if (!isValidOptInclination(incFsStr)) return;

      // backsight inclination
      var incBsStr =         line.substring(35, 40);
      if (!isValidOptInclination(incBsStr)) return;

      // left
      var lStr =             line.substring(40, 43);
      // Yes, sadly I have found negative LRUD values in Chip's format and apparently
      // his program doesn't fail on them, so I have to accept them here
      // isValidOptFloat instead of isValidOptUFloat
      if (!isValidOptFloat(lStr)) return;

      // right
      var rStr =             line.substring(43, 46);
      if (!isValidOptFloat(rStr)) return;

      // up
      var uStr =             line.substring(46, 49);
      if (!isValidOptFloat(uStr)) return;

      // down
      var dStr =             line.substring(49, 52);
      if (!isValidOptFloat(dStr)) return;

      var shot = {
        // to station name
        to: toStr.trim(),
        // from station name
        from: fromStr.trim(),
        // distance
        dist: undefined, // will be set below
        // frontsight azimuth
        azmFs: parseFloat(azmFsStr),
        // backsight azimuth
        azmBs: parseFloat(azmBsStr),
        // frontsight inclination
        incFs: parseFloat(incFsStr),
        // backsight inclination
        incBs: parseFloat(incBsStr),
        // left
        l: parseFloat(lStr),
        // right
        r: parseFloat(rStr),
        // up
        u: parseFloat(uStr),
        // down
        d: parseFloat(dStr),
      };

      comment = undefined;

      // parse distance

      if (inches) {
        // sometimes inches are omitted, hence the || 0...I'm assuming it's possible
        // for feet to be omitted as well
        shot.distInches = parseFloat(inchesStr) || 0;
        shot.dist = (parseFloat(feetStr) || 0) + shot.distInches / 12,
        shot.flag = line.charAt(17);

        // NOTE there are two columns around here that can contain a *.
        // I think they might represent different values, but thisis confused by
        // the fact that for ft/in shots, if there is a D or H flag it occupies the
        // first column that can contain a * for decimal feet shots
        shot.exclude = line.charAt(18) === '*';
      } else {
        shot.dist = parseFloat(feetStr),
        shot.flag = line.charAt(16);
        shot.exclude = line.charAt(17) === '*';
      }

      // convert horizontal and diagonal shots to standard
      // in this case incFs is the vertical offset between stations
      // fortunately it appears we can always count on incFs being specified
      // and incBs not being specified for these types of shots

      if (shot.flag === 'H') {
        // distance is horisontal hoffset and incFs is vertical offset
        var dist = shot.horizDist = shot.dist;
        shot.dist = Math.sqrt(dist * dist + shot.incFs * shot.incFs);
        shot.vertDist = shot.incFs;
        shot.incFs = Math.atan2(shot.incFs, dist);
      }
      else if (shot.flag === 'D') {
        // distance is as usual, but incFs is vertical offset
        shot.vertDist = shot.incFs;
        shot.incFs = Math.asin(shot.incFs / shot.dist);
      }

      if (shot.flag === 'H' || shot.flag === 'D') {
        switch (incUnit) {
          case 'G':
            shot.incFs *= 200 / Math.PI;
            break;
          case 'M':
            shot.incFs *= 3200 / Math.PI;
            break;
          default:
            shot.incFs *= 180 / Math.PI;
            break;
        }
      }

      switch (azmUnit) {
        case 'G':
          shot.azmFs %= 400.0;
          shot.azmBs %= 400.0;
          break;
        case 'M':
          shot.azmFs %= 6400.0;
          shot.azmBs %= 6400.0;
          break;
        default:
          shot.azmFs %= 360.0;
          shot.azmBs %= 360.0;
          break;
      }

      for (var key in shot) {
        if (typeof shot[key] === 'number' && isNaN(shot[key])) {
          delete shot[key];
        }
      }

      emitter.emit('shot', shot);
    }
  }
}
