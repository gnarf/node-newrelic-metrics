var index = require( "../../index" );

var expects = {
	agent: require("../../lib/agent"),
	component: require("../../lib/component"),
	metrics: require("../../lib/metrics")
};

Object.keys(expects).forEach( function( key ) {
	exports[ key ] = {};
	exports[ key ][ "exports lib/" + key ] = function( test ) {
		test.expect( 1 );
		test.equal( index[ key ], expects[ key ] );
		test.done();
	};
});
