var metrics = require("../../lib/metrics");
var index = require("../../index");

exports.metrics = function( test ) {
	test.expect( 1 );
	test.equal( index.metrics, metrics );
	test.done();
};
