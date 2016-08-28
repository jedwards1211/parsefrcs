var utils = require('./utils')
var _parseInt = utils.parseInt
var _parseUint = utils.parseUint
var _parseOptUint = utils.parseOptUint

/**
 * Parses data from a calculated survey file.  These look like so:
<pre>  123.182259
  AE20     1    1       0       0      0   153  -257   -51    85   0  20     1
  AE19     1    2     653     402   -548  1046  -587  -174    97   0 200     1
  AE18     2    3     669     449  -3002   995    94  -597   -56 250   0     1
  AE17     3    4     539    1217  -2770   497    47  -298   -28   0   0     1
  AE16     4    5     544    1230  -3441   411  -284  -246   170  60  10     1
  AE15     5    6    1679    1663  -3833     0     0  -282   283  20  10     1
  AE14     6    7    2026    2617  -3730   446   225  -446  -225   0  30     1
  AE13     7    8     391    3152  -5788  -111   691     0     0 200  50     1
  AE12     8    9   -1019    2175  -4630  -369   336   221  -201  40  40     1
  AE11     9   10   -1516    1289  -3919  -348   195   610  -342  50  10     1</pre>
 *
 * @param {EventEmitter} emitter - calculatedShot events will be emitted on this
 * @returns {Function} that you should call for each line in a file.  Each line that
 * is a valid calculated shot line will be passed to visitor.acceptCalculatedShot.
 */
function parseCalculatedShot(line) {
  if (line.length >= 72) {
    try {
      return {
        // name of the to station
        toName: line.substring(0, 6).trim(),
        // whether the shot is a surface measurement
        surface: line.charAt (6).toLowerCase() === 's',
        // index of the from station
        fromNum: _parseUint(line.substring(7, 12)),
        // index of the to station
        toNum: _parseUint(line.substring(12, 17)),
        // x position of the to station
        x: _parseInt (line.substring(17, 25)) / 100,
        // y position of the to station
        y: _parseInt (line.substring(25, 33)) / 100,
        // z position of the to station
        z: _parseInt (line.substring(33, 40)) / 100,
        // x offset of the left wall at to station
        lx: _parseInt (line.substring(40, 46)) / 100,
        // y offset of the left wall at to station
        ly: _parseInt (line.substring(46, 52)) / 100,
        // x offset of the right wall at to station
        rx: _parseInt (line.substring(52, 58)) / 100,
        // y offset of the right wall at to station
        ry: _parseInt (line.substring(58, 64)) / 100,
        // up at to station
        u: _parseUint(line.substring(64, 68)) / 10,
        // down at to station
        d: _parseUint(line.substring(68, 72)) / 10,
        // trip number
        tripNum: _parseOptUint(line.substring(72, 78))
      }
    }
    catch (e) {
      // return undefined;
    }
  }
}

module.exports = function (emitter) {
  return function (line) {
    var data = parseCalculatedShot(line)
    if (data) emitter.emit('calculatedShot', data)
  }
}

module.exports.parseCalculatedShot = parseCalculatedShot
