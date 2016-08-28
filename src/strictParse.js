const intRegex = /^\s*-?\d+$/
const uintRegex = /^\s*\d+$/
const ufloatRegex = /^\s*(\d+(\.\d*)?|\.\d+)$/

export function parseInt(s) {
  if (!s.match(intRegex)) throw new Error('invalid int: ' + s)
  return parseInt(s)
}

export function parseUint(s) {
  if (!s.match(uintRegex)) throw new Error('invalid uint: ' + s)
  return parseInt(s)
}

export function parseUfloat(s) {
  if (!s.match(ufloatRegex)) throw new Error('invalid ufloat: ' + s)
  return parseFloat(s)
}
