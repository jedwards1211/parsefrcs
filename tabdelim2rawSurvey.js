function setw(s, length) {
	if (s === undefined || s === null) {
		return s;
	}
	s = String(s);
	var match = /\.0*$/.exec(s);
	if (match) {
		s = s.substring(0, match.index);
	}
	if (s.length > length) {
		return s.substring(0, length);
	}
	var a = [];
	a.length = length - s.length + 1;
	return a.join(' ') + s;
}



console.log(
	require('fs').readFileSync(process.argv[2], 'utf8').split(/\r\n|\r|\n/)
	.map(function(line) { 
		return line.split('\t');
	})
	.map(function(shot) {
		return [5, 5, 6, 2, 6, 6, 5, 5, 3, 3, 3, 3].map(function(length, index) {
			return setw(shot[index], length);
		}).join('');
	})
	.join('\n')
);
