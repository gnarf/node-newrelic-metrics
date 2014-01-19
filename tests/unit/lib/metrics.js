var metrics = require("../../../lib/metrics.js");

exports.metrics = function(test) {
	test.expect(1);
	test.ok(metrics.Metric, "yay");
	test.done();
};
