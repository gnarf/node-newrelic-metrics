var agent = require( "./agent" );

function asyncNoop( callback ) {
	if (callback) {
		callback();
	}
}

// bound to a component at start time
function poller()
{
	var deliver = function( err ) {
		// one time callback
		deliver = function() {};
		if ( err ) {
			return;
		}
		this.agent.deliver( this );
	}.bind( this );

	/* jshint validthis:true */
	this.poll( function( err ) {
		deliver( err );
	}.bind( this ) );
}

// extra constructor logic for a component
function buildComponent() {
	/* jshint validthis:true */
	var oldMetrics = this.metrics;
	this.metrics = Object.keys( oldMetrics ).reduce( function( memo, key ) {
		var value = oldMetrics[ key ];

		// array of metrics
		if ( value.length ) {
			memo[ key ] = value.map( function( metric ) {
				return metric.clone();
			});
		} else {
			memo[ key ] = value.clone();
		}
		return memo;
	}, {});

	if ( !( this.agent && this.agent.deliver) ) {
		this.agent = new agent.Agent( this.agent );
	}
}

function seedOrRead( method )
{
	return function( values ) {
		Object.keys( values ).forEach(function( key ) {
			[].concat( this.metrics[ key ] || [] ).forEach( function( metric ) {
				metric[ method ]( values[ key ] );
			});
		}, this);
	};
}

var componentPrototype = {
	configure: function( obj ) {
		Object.keys( obj ).forEach( function( key ) {
			this[ key ] = obj[ key ];
		}, this );
	},
	// how often to poll
	duration: 60,
	metrics: {},
	init: asyncNoop,
	poll: asyncNoop,

	// start the polling interval
	start: function() {
		if (!this._interval) {
			this.init(function( err ) {
				if ( err ) {
					return;
				}
				if ( this.duration ) {
					this._interval = setInterval( poller.bind( this ), this.duration * 1000 );
				}
			}.bind( this ));
		}
	},

	// stop the polling interval
	stop: function() {
		if ( this._interval ) {
			clearInterval( this._interval );
			this._interval = null;
		}
	},

	// seed the metrics
	seed: seedOrRead( "seed" ),
	read: seedOrRead( "read" ),
	collect: function() {
		var result = {
			guid: this.guid,
			name: this.name,
			duration: this.duration,
			metrics: {}
		};
		Object.keys( this.metrics ).forEach( function( key ) {
			[].concat( this.metrics[ key ] || [] ).forEach( function( metric ) {
				metric.collect( result.metrics );
			});
		}, this );
		return result;
	},
};

function validateProtoOptions(obj) {
	if ( !obj.guid ) {
		throw new Error( "Must have guid" );
	}
	if ( typeof obj.duration !== "number" || obj.duration < 0) {
		throw new Error( "Duration must be a non-negative number" );
	}
}

exports.factory = function( prototype ) {
	function Component( opts ) {
		if ( !( this instanceof Component ) ) {
			return new Component( opts );
		}
		this.configure( opts || {} );
		validateProtoOptions( this );
		buildComponent.call( this );
	}
	Component.prototype = Object.create(componentPrototype);
	Component.prototype.constructor = Component;
	Component.prototype.configure( prototype || {} );

	validateProtoOptions(Component.prototype);

	return Component;
};
