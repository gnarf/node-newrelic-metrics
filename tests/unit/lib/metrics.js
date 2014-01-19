var metrics = require( "../../../lib/metrics.js" );

exports.Metric = {
	"constructor exists": function( test ) {
		test.expect( 2 );
		test.ok( metrics.Metric, "exists" );
		test.equal( typeof metrics.Metric, "function" );
		test.done();
	},
	"invalid names": function( test ) {
		var invalid = [
			"!", "@", "#", "Component/Test", "test/no spaces"
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
			"test/no_spaces", "Another/Metric_Name"
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
			"!", "@", "#", "Component/Test/sec", "test/no spaces"
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
			"Value/Sec", "Value|Count", "Value", "!Value"
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
			this.metric = new metrics.Metric( "Test", "TestUnit" );
			done();
		},
		tearDown: function( done ) {
			delete this.metric;
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
		}
	}
};
