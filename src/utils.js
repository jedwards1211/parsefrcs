export function repeat(s, times) {
  var result = ''
  while (--times >= 0) {
    result += s
  }
  return result
}

export function setw(s, cols) {
  s = String(s)
  if (s.length < cols) {
    return repeat(' ', cols - s.length) + s
  }
  return s
}

export function findColumnWidths(line) {
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

export function fixedWidthSplit(line, columnWidths) {
  var i = 0
  var start = 0
  var result = []
  while (i < columnWidths.length && start < line.length) {
    result.push(line.substring(start, start + columnWidths[i]).trim())
    start += columnWidths[i]
  }
  return result
}

const intRegex = /^-?\d+$/
const uintRegex = /^\d+$/
const ufloatRegex = /^(\d+(\.\d*)?|\.\d+)$/

export function strictParseInt(s) {
  if (!s.match(intRegex)) throw new Error(`invalid int: '${s}'`)
  return parseInt(s)
}

export function parseUint(s) {
  if (!s.match(uintRegex)) throw new Error(`invalid uint: '${s}'`)
  return strictParseInt(s)
}

export function parseOptUint(s) {
  if (!s.match(uintRegex)) return undefined
  return strictParseInt(s)
}

export function parseUfloat(s) {
  if (!s.match(ufloatRegex)) throw new Error(`invalid ufloat: '${s}'`)
  return parseFloat(s)
}

export function oppositeDeg(deg) {
  return deg < 180 ? deg + 180 : deg - 180
}

export function gradToDeg(grad) {
  return (grad * 18) / 20
}

export function milToDeg(mil) {
  return (mil * 18) / 320
}

export function azmDiff(a, b) {
  const diff = Math.abs(a - b)
  return diff > 180 ? 360 - diff : diff
}

const METERS_TO_FEET = 1 / 0.3048

export function metersToFeet(meters) {
  return meters * METERS_TO_FEET
}
