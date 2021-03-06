var fs = require( "fs" );
var path = require( "path" );
var ROOT = path.resolve( __dirname, ".." );

all([
	unitTests,
	jshint
], function( errors ) {
	if ( errors.length ) {
		process.exit( 1 );
	}
});

function all( steps, callback ) {
	var errors = [];

	function next() {
		var step = steps.shift();
		step(function( error ) {
			if ( error ) {
				errors.push( error );
			}

			if ( !steps.length ) {
				return callback( errors );
			}

			next();
		});
	}

	next();
}

function readJSON( filename )
{
	var buffer = fs.readFileSync( filename, "utf8" );
	try {
		return JSON.parse(buffer);
	} catch (e) {
		throw "Unable to read JSON file " + filename;
	}
}

function unitTests( callback ) {
	var nodeunit = require( "nodeunit" );
	var reporter = nodeunit.reporters.default;
	var options = require( "nodeunit/bin/nodeunit.json" );

	reporter.run([ "tests/unit", "tests/unit/lib" ], options, callback );
}

function jshint( callback ) {

	function root( filename ) {
		return path.resolve( ROOT, filename );
	}

	var jshintrc = readJSON( root( ".jshintrc" ) );
	var globals = {};
	if ( jshintrc.globals ) {
		globals = jshintrc.globals;
		delete jshintrc.globals;
	}
	var JSHINT = require( "jshint/src/jshint.js" ).JSHINT;
	var cli = require( "jshint/src/cli" );
	var reporter = require( "jshint/src/reporters/default" ).reporter;

	var files = cli.gather({
		args: [ "index.js", "lib", "tests" ].map( root )
	});

	var errors = [];
	var data = [];
	files.forEach(function(file) {
		var buffer = fs.readFileSync( file, "utf8" );
		var relative = file.replace( ROOT, "" );

		if (!JSHINT(buffer, jshintrc, globals)) {
			JSHINT.errors.forEach(function (err) {
				if (err) {
					errors.push({ file: relative, error: err });
				}
			});
			var lintData = JSHINT.data();
			if (lintData) {
				lintData.file = relative;
				data.push(lintData);
			}
		}
	});

	reporter(errors, [], { verbose: true });
	console.log( "jshint check: " + files.length + " files checked, " + errors.length + " errors" );

	if (errors.length) {
		callback(errors);
	} else {
		callback();
	}
}
