var component = require( "../../../lib/component" );
var sinon = require("sinon");

var epoch = +new Date(1980, 4, 27, 4);

exports.factory = function( test ) {
	test.expect( 2 );
	test.ok( component.factory, "factory exists" );
	test.equal( typeof component.factory, "function", "factory is a method" );
	test.done();
};

exports["factory options"] = {
	"guid: required": function( test ) {
		test.expect( 2 );
		// stuff the hash with all other required options if others are ever added
		test.throws( function() {
			component.factory( { guid: null } );
		}, "{ guid: null }");
		test.throws( function() {
			component.factory( {} );
		}, "{}" );
		test.done();
	},
	"duration: default": function( test ) {
		var factory = component.factory({
			guid: "test"
		});
		test.equal(factory.prototype.duration, 60);
		test.done();
	},
	"duration: number": function( test ) {
		var factory = component.factory({
			guid: "test",
			duration: 180
		});
		test.equal(factory.prototype.duration, 180);
		test.done();
	},
	"duration: invalid options": function( test ) {
		test.throws( function() {
			component.factory({
				guid: "test",
				duration: "180"
			});
		});
		test.throws( function() {
			component.factory({
				guid: "test",
				duration: -1
			});
		});
		test.done();
	},
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
	"test instance shape": {
		setUp: function( done ) {
			this.instance = this.factory({});
			done();
		},
		tearDown: function( done ) {
			delete this.instance;
			done();
		},
		start: function( test ) {
			test.equal(typeof this.instance.start, "function");
			test.done();
		},
		stop: function( test ) {
			test.equal(typeof this.instance.stop, "function");
			test.done();
		},
		init: function( test ) {
			test.equal(typeof this.instance.poll, "function");
			test.done();
		},
		poll: function( test ) {
			test.equal(typeof this.instance.poll, "function");
			test.done();
		},
	},
	"test polling logic": {
		setUp: function( done ) {
			this.clock = sinon.useFakeTimers( epoch );
			this.init = sinon.stub();
			this.poll = sinon.stub();
			this.payload = {};
			this.instance = this.factory({
				duration: 10,
				init: this.init,
				poll: this.poll,
				agent: {
					deliver: sinon.spy()
				},
				collect: sinon.spy( function() { return this.payload; }.bind( this ) )
			});
			done();
		},
		tearDown: function( done ) {
			this.clock.restore();
			delete this.clock;
			delete this.init;
			delete this.payload;
			delete this.poll;
			delete this.instance;
			done();
		},
		"standard logic": function( test ) {
			this.instance.start();
			test.ok( this.init.called, "init called" );
			test.ok( !this.poll.called, "poll not called" );

			// init hasn't called back yet, clock ticking shouldn't matter
			this.clock.tick( 100000 );
			test.ok( !this.poll.called, "poll not called" );

			this.init.yield();
			this.clock.tick( 10000 );
			test.ok( this.poll.called, "poll called" );

			// a second poll should start even if the first fails to respond
			this.clock.tick( 30000 );
			test.equal( this.poll.callCount, 4, "poll called 3 more times" );

			// responding to the poll
			this.poll.firstCall.yield();
			test.ok( this.instance.agent.deliver.calledWith( this.instance ), "called agent deliver" );

			// calls the first one again, so this is a good test too
			this.poll.yield();
			test.equal( this.instance.agent.deliver.callCount, 4, "called deliver 3 more times" );

			test.done();
		},
	},
	"duration: number": function( test ) {
		var instance = this.factory({
			guid: "test",
			duration: 180
		});
		test.equal( instance.duration, 180 );
		test.done();
	},
	"duration: invalid options": function( test ) {
		var factory = this.factory;
		test.throws( function() {
			factory({
				guid: "test",
				duration: "180"
			});
		});
		test.throws( function() {
			factory({
				guid: "test",
				duration: -1
			});
		});
		test.done();
	},
};

function MockMetric( name ) {
	return {
		seed: sinon.spy(),
		read: sinon.spy(),
		collect: sinon.spy(function( carry ) {
			carry[name] = name;
			return carry;
		}),
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
	},
	"test collect": function( test ) {
		var instance = this.factory({ name: "testname", duration: 10 });
		var result = instance.collect();
		test.deepEqual( result.metrics, {
			test: "test",
			"testArray[0]": "testArray[0]",
			"testArray[1]": "testArray[1]"
		}, "valid response from collect" );

		test.ok( instance.metrics.test.collect.calledWith( result.metrics ) );
		test.ok( instance.metrics.testArray[0].collect.calledWith( result.metrics ) );
		test.ok( instance.metrics.testArray[1].collect.calledWith( result.metrics ) );

		test.equal( result.guid, "test.metrics.factory" );
		test.equal( result.name, "testname" );
		test.equal( result.duration, 10 );

		test.done();
	}
};

// create seed and read tests
[ "seed", "read" ].forEach( function( method ) {
	this["test " + method] = function( test ) {
		var instance = this.factory();
		instance[ method ]({
			test: 1,
			testArray: 2
		});
		test.ok( instance.metrics.test[ method ].calledWith( 1 ), "right value to test" );
		test.ok( instance.metrics.testArray[ 0 ][ method ].calledWith( 2 ), "right value to testArray[0]" );
		test.ok( instance.metrics.testArray[ 1 ][ method ].calledWith( 2 ), "right value to testArray[1]" );

		instance.metrics.test[ method ].reset();
		instance.metrics.testArray[ 0 ][ method ].reset();
		instance.metrics.testArray[ 1 ][ method ].reset();
		instance[ method ]({
			test: 3
		});

		test.ok( instance.metrics.test[ method ].calledWith( 3 ), "called test" );
		test.ok( !instance.metrics.testArray[ 0 ][ method ].called, "did not call testArray" );
		test.ok( !instance.metrics.testArray[ 1 ][ method ].called, "did not call testArray" );

		test.done();
	};
}, exports["test metrics factory"]);
