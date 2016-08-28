var intRegex = /^\s*-?\d+$/;
var uintRegex = /^\s*\d+$/;
var ufloatRegex = /^\s*(\d+(\.\d*)?|\.\d+)$/;

module.exports.parseInt = function(s) {
	if (!s.match(intRegex)) throw new Error('invalid int: ' + s);
	return parseInt(s);
}

module.exports.parseUint = function(s) {
	if (!s.match(uintRegex)) throw new Error('invalid uint: ' + s);
	return parseInt(s);
}

module.exports.parseUfloat = function(s) {
	if (!s.match(ufloatRegex)) throw new Error('invalid ufloat: ' + s);
	return parseFloat(s);
}
