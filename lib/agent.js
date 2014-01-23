var os = require( "os" );
var https = require( "https" );

var Agent = exports.Agent = function( config ) {
	Object.keys( config || {} ).forEach( function( key ) {
		this[ key ] = config[ key ];
	}, true );
};

Agent.prototype.version = require("../package.json").version;
Agent.prototype.name = "node-newrelic-metrics";
Agent.prototype.host = os.hostname();

Agent.prototype.deliver = function( component ) {
	var componentData = component.collect();
	var apiKey = this.apiKey || component.apiKey;
	var payload = JSON.stringify({
		agent: {
			host: this.host || component.apiKey,
			pid: process.pid,
			version: this.version
		},
		components: [ componentData ]
	});

	var options = {
		hostname: "platform-api.newrelic.com",
		port: 443,
		path: "/platform/v1/metrics",
		method: "POST",
		headers: {
			"X-License-Key": apiKey,
			"Content-Type": "application/json",
			"Accept": "application/json",
			"Content-Length": payload.length
		}
	};

	var request = ( this.request || https.request )( options, function( response ) {
		response.setEncoding( "utf8" );
		response.on( "data", console.log.bind( console, "response:" ) );
	});
	request.write( payload );
	request.end();

};
