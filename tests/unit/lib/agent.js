var agent = require( "../../../lib/agent.js" );

exports.Agent = {
	"constructor exists": function( test ) {
		test.equal( typeof agent.Agent, "function" );
		test.done();
	},
};
