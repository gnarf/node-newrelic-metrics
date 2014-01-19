var validMetricName = /^(?!Component)[a-zA-Z_\/-]+$/;
var validUnitName = /^(?:\w+|\!\w+|\w+(?:\/|\|)\w+)$/;

var Metric = exports.Metric = function(name, units) {
	if (typeof name !== "string") {
		throw new Error("Metric name must be a string");
	}
	if (!validMetricName.test(name))
	{
		throw new Error("Invalid metric name: " + name);
	}
	if (!validUnitName.test(units))
	{
		throw new Error("Invalid unit name: " + units);
	}

	// read only non configurable properties
	Object.defineProperties( this, {
		name: { value: name },
		units: { value: units },
	});
};

Metric.prototype.keyName = function() {
	return "Component/" + this.name + "[" + this.units + "]";
};

Metric.prototype.toString = function() {
	return "[Metric " + this.keyName() + "]";
};
