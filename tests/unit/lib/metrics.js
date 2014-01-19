var sinon = require( "sinon" );
var metrics = require( "../../../lib/metrics.js" );

var metricTests = exports.Metric = {
	"constructor exists": function( test ) {
		test.expect( 2 );
		test.ok( metrics.Metric, "exists" );
		test.equal( typeof metrics.Metric, "function" );
		test.done();
	},
	"invalid names": function( test ) {
		var invalid = [
			1, null, undefined, "!", "@", "#", "Component/Test"
		];
		test.expect( invalid.length );
		invalid.forEach( function( name ) {
			test.throws( function() {
				return new metrics.Metric( name, "units" );
			}, "Threw error for " + name );
		});
		test.done();
	},
	"valid names": function( test ) {
		var valid = [
			"test/no_spaces", "Another/Metric_Name", "test/allow spaces"
		];
		test.expect( valid.length );
		valid.forEach( function( name ) {
			test.doesNotThrow( function() {
				return new metrics.Metric( name, "units" );
			}, "Threw error for " + name );
		});
		test.done();
	},
	"invalid units": function( test ) {
		var invalid = [
			1, null, undefined, "!", "@", "#", "Component/Test/sec", "test/no spaces", "!Value"
		];
		test.expect( invalid.length );
		invalid.forEach( function( units ) {
			test.throws( function() {
				return new metrics.Metric( "name", units );
			}, "Threw error for " + units );
		});
		test.done();
	},
	"valid units": function( test ) {
		var valid = [
			"Value/Sec", "Value|Count", "Value", "|Value"
		];
		test.expect( valid.length );
		valid.forEach( function( units ) {
			test.doesNotThrow( function() {
				return new metrics.Metric( "name", units );
			}, "Threw error for " + units );
		});
		test.done();
	},
	"with instance": {
		setUp: function( done ) {
			this.epoch = 1390163149832;
			this.clock = sinon.useFakeTimers(this.epoch);
			this.metric = new metrics.Metric( "Test", "TestUnit" );
			done();
		},
		tearDown: function( done ) {
			delete this.metric;
			delete this.epoch;
			this.clock.restore();
			delete this.clock;
			done();
		},
		"read only name and units": function( test ) {
			test.expect( 4 );
			var metric = this.metric;
			metric.name = "Error!";
			test.equal(metric.name, "Test", "trying to write name did nothing");
			metric.units = "Error!";
			test.equal(metric.units, "TestUnit", "trying to write units did nothing");

			test.throws( function() {
				Object.defineProperty(metric, "name", { value: "Error!"});
			}, "threw trying to define name" );
			test.throws( function() {
				Object.defineProperty(metric, "units", { value: "Error!"});
			}, "threw trying to define units" );
			test.done();
		},
		keyName: function( test ) {
			test.expect( 1 );
			test.equal( this.metric.keyName(), "Component/Test[TestUnit]" );
			test.done();
		},
		toString: function( test ) {
			test.expect( 1 );
			test.equal( this.metric.toString(), "[Metric Component/Test[TestUnit]]" );
			test.done();
		},
		lastCollect: function( test ) {
			test.expect( 1 );
			test.equal( this.metric.lastCollect, this.epoch, "Correct Time" );
			test.done();
		},
		values: function( test ) {
			test.expect( 1 );
			test.deepEqual( this.metric.values, [] );
			test.done();
		},
		add: function( test ) {
			test.expect( 2 );
			this.metric.add( 100 );
			test.deepEqual( this.metric.values, [ 100 ] );
			this.metric.add( 200 );
			test.deepEqual( this.metric.values, [ 100, 200 ] );
			test.done();
		},
		read: function( test ) {
			test.expect( 1 );
			test.equal( this.metric.read, this.metric.add, "read is alias to add" );
			test.done();
		},

		// generated later:
		summarize: {}
	}
};

// generate summarize metricTests:
[{
	values: [],
	expect: { min: 0, max: 0, count: 0, total: 0, sum_of_squares: 0 }
}, {
	values: [ 1, 2, 3, 4, 5 ],
	expect: { min: 1, max: 5, count: 5, total: 15, sum_of_squares: 55 }
}, {
	values: [ 100 ],
	expect: { min: 100, max: 100, count: 1, total: 100, sum_of_squares: 10000 }
}].forEach( function( fixture ) {
	var values = JSON.stringify( fixture.values );
	metricTests[ "with instance" ].summarize[ values ] = function( test ) {
		test.expect( 1 );
		fixture.values.forEach( this.metric.add.bind( this.metric ) );
		test.deepEqual( this.metric.summarize(), fixture.expect, values );
		test.done();
	};
});

exports.Counter = {
	setUp: function( done ) {
		this.epoch = 1390163149832;
		this.clock = sinon.useFakeTimers(this.epoch);
		done();
	},
	tearDown: function( done ) {
		delete this.counter;
		delete this.epoch;
		this.clock.restore();
		delete this.clock;
		done();
	},
	"constructor exists": function( test ) {
		test.expect( 2 );
		test.ok( metrics.Counter, "exists" );
		test.equal( typeof metrics.Counter, "function" );
		test.done();
	},
	"per second": {
		setUp: function( done ) {
			this.counter = new metrics.Counter( "Test", "Tests/second" );
			done();
		},
		unitTime: function( test ) {
			test.expect( 1 );
			test.equal( this.counter.unitTime, 1000 );
			test.done();
		},
		"calculates per second properly": function( test ) {
			test.expect( 1 );
			this.clock.tick( 100 );
			this.counter.seed( 0 );
			this.clock.tick( 500 );
			this.counter.read( 100 );
			test.equal( this.counter.values[ 0 ], 200 );
			test.done();
		}
	},
	"per minute": {
		setUp: function( done ) {
			this.counter = new metrics.Counter( "Test", "Tests/minute" );
			done();
		},
		unitTime: function( test ) {
			test.expect( 1 );
			test.equal( this.counter.unitTime, 60000 );
			test.done();
		},
		"calculates per minute properly": function( test ) {
			test.expect( 1 );
			this.counter.seed( 100 );
			this.clock.tick( 120000 );
			this.counter.read( 110 );
			test.equal( this.counter.values[ 0 ], 5 );
			test.done();
		}
	},
	"per hour": {
		setUp: function( done ) {
			this.counter = new metrics.Counter( "Test", "Tests/hour" );
			done();
		},
		unitTime: function( test ) {
			test.expect( 1 );
			test.equal( this.counter.unitTime, 3600000 );
			test.done();
		},
		"calculates per hour properly": function( test ) {
			test.expect( 1 );
			this.counter.seed( 0 );
			this.clock.tick( 1800000 );
			this.counter.read( 100 );
			test.equal( this.counter.values[ 0 ], 200 );
			test.done();
		}
	}
};
