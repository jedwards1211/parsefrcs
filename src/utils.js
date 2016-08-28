var repeat = module.exports.repeat = function (s, times) {
  var result = ''
  while (--times >= 0) {
    result += s
  }
  return result
}

module.exports.setw = function (s, cols) {
  s = String(s)
  if (s.length < cols) {
    return repeat(' ', cols - s.length) + s
  }
  return s
}

module.exports.findColumnWidths = function (line) {
  var rx = /\s*\S+/g
  var match
  var widths = []
  do {
    match = rx.exec(line)
    if (match) {
      widths.push(match[0].length)
    }
  } while (match)
  return widths
}

module.exports.fixedWidthSplit = function (line, columnWidths) {
  var i = 0
  var start = 0
  var result = []
  while (i < columnWidths.length && start < line.length) {
    result.push(line.substring(start, start + columnWidths[i]).trim())
    start += columnWidths[i]
  }
  return result
}

var intRegex = /^\s*-?\d+$/
var uintRegex = /^\s*\d+$/
var ufloatRegex = /^\s*(\d+(\.\d*)?|\.\d+)$/

module.exports.parseInt = function (s) {
  if (!s.match(intRegex)) throw new Error('invalid int: ' + s)
  return parseInt(s)
}

module.exports.parseUint = function (s) {
  if (!s.match(uintRegex)) throw new Error('invalid uint: ' + s)
  return parseInt(s)
}

module.exports.parseOptUint = function (s) {
  if (!s.match(uintRegex)) return undefined
  return parseInt(s)
}

module.exports.parseUfloat = function (s) {
  if (!s.match(ufloatRegex)) throw new Error('invalid ufloat: ' + s)
  return parseFloat(s)
}

module.exports.oppositeDeg = function (deg) {
  return deg < 180 ? deg + 180 : deg - 180
}

module.exports.gradToDeg = function (grad) {
  return grad * 18 / 20
}

module.exports.milToDeg = function (mil) {
  return mil * 18 / 320
}

var METERS_TO_FEET = 1 / 0.3048

module.exports.metersToFeet = function (meters) {
  return meters * METERS_TO_FEET
}
