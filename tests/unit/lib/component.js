var component = require( "../../../lib/component" );
var sinon = require("sinon");

// var epoch = new Date(1980, 4, 27, 4);

exports.factory = function( test ) {
	test.expect( 2 );
	test.ok( component.factory, "factory exists" );
	test.equal( typeof component.factory, "function", "factory is a method" );
	test.done();
};

exports["factory requires guid"] = function( test ) {
	test.expect( 2 );
	// stuff the hash with all other required options if others are ever added
	test.throws( function() {
		component.factory( { guid: null } );
	}, "{ guid: null }");
	test.throws( function() {
		component.factory( {} );
	}, "{}" );
	test.done();
};

exports["test factory"] = {
	setUp: function( done ) {
		this.factory = component.factory({ guid: "test.factory" });
		done();
	},
	tearDown: function( done ) {
		delete this.factory;
		done();
	},
	"test instance": function( test ) {
		test.expect( 2 );
		var instance = this.factory({ test: true });
		test.equal( instance.test, true, "got instance variable" );
		test.equal( instance.guid, "test.factory", "got factory variable" );
		test.done();
	},
};

function MockMetric( name ) {
	return {
		read: sinon.spy(),
		clone: sinon.spy(function() {
			return MockMetric( name );
		})
	};
}

exports["test metrics factory"] = {
	setUp: function( done ) {
		this.factory = component.factory({
			guid: "test.metrics.factory",
			metrics: {
				test: MockMetric("test"),
				testArray: [
					MockMetric("testArray[0]"),
					MockMetric("testArray[1]"),
				]
			}
		});
		done();
	},
	tearDown: function( done ) {
		delete this.factory;
		done();
	},
	"test instance": function( test ) {
		test.expect( 8 );
		var proto = this.factory.prototype;
		test.ok( !proto.metrics.test.clone.called );
		var instance = this.factory();
		test.ok( proto.metrics.test.clone.called );
		test.notEqual( instance.metrics, proto.metrics );
		test.notEqual( instance.metrics.test, proto.metrics.test );
		test.equal( instance.metrics.test.name, proto.metrics.test.name );
		test.notEqual( instance.metrics.testArray, proto.metrics.testArray );
		test.notEqual( instance.metrics.testArray[0], proto.metrics.testArray[0] );
		test.equal( instance.metrics.testArray[0].name, proto.metrics.testArray[0].name );
		test.done();
	}
};

