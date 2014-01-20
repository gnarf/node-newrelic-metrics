var component = require( "../../../lib/component" );

exports.factory = function( test ) {
	test.expect( 2 );
	test.ok( component.factory, "factory exists" );
	test.equal( typeof component.factory, "function", "factory is a method" );
	test.done();
};
