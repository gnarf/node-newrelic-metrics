function noop( callback ) { callback(); }

var componentPrototype = {
	configure: function( obj ) {
		Object.keys( obj ).forEach( function( key ) {
			this[ key ] = obj[ key ];
		}, this );
	},
	copyProto: function() {
		var oldMetrics = this.metrics;
		this.metrics = Object.keys( oldMetrics ).reduce(function( memo, key ) {
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
	},
	// how often to poll
	duration: 60,
	metrics: {},
	init: noop,
	poll: noop
};

function ValidateProtoOptions(obj)
{
	if ( !obj.guid )
	{
		throw new Error( "Must have guid" );
	}
	if ( typeof obj.duration !== "number" || obj.duration < 0)
	{
		throw new Error( "Duration must be a non-negative number" );
	}
}

exports.factory = function( prototype ) {
	function Component( opts ) {
		if ( !( this instanceof Component ) ) {
			return new Component( opts );
		}
		this.configure( opts || {} );
		this.copyProto();
		ValidateProtoOptions(this);
	}
	Component.prototype = Object.create(componentPrototype);
	Component.prototype.constructor = Component;
	Component.prototype.configure( prototype || {} );

	ValidateProtoOptions(Component.prototype);

	return Component;
};
