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
	metrics: {},
	init: noop,
	poll: noop
};

exports.factory = function( prototype ) {
	if ( !( prototype && prototype.guid ))
	{
		throw("component.factory requires a guid");
	}
	function Component( opts ) {
		if ( !( this instanceof Component ) ) {
			return new Component( opts );
		}
		this.configure( opts || {} );
		this.copyProto();
	}
	Component.prototype = Object.create(componentPrototype);
	Component.prototype.constructor = Component;
	Component.prototype.configure( prototype || {} );

	return Component;
};
