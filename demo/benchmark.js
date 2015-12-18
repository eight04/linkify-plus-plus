var sum = {};
var benchmark = function() {
	var ts = {};
	return function (tag) {
		if (ts[tag]) {
			sum[tag] = (sum[tag] || 0) + Date.now() - ts[tag];
			ts[tag] = null;
		} else {
			ts[tag] = Date.now();
		}
	};
}();
