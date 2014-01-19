var validMetricName = /^(?!Component)[a-zA-Z_\/ -]+$/;
var validUnitName = /^(?:\w+|\|\w+|\w+(?:\/|\|)\w+)$/;

var Metric = exports.Metric = function(name, units) {
	if (typeof name !== "string") {
		throw new Error("Metric name must be a string");
	}
	if (typeof units !== "string") {
		throw new Error("Metric units must be a string");
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

	this.lastCollect = Date.now();
	this.values = [];
};

Metric.prototype.keyName = function() {
	return "Component/" + this.name + "[" + this.units + "]";
};

Metric.prototype.toString = function() {
	return "[Metric " + this.keyName() + "]";
};

Metric.prototype.summarize = function() {
	return this.values.reduce(function(summary, value) {
		// first value is both min and max
		if (!summary.count)
		{
			summary.min = summary.max = value;
		} else {
			summary.min = Math.min(value, summary.min);
			summary.max = Math.max(value, summary.max);
		}
		summary.count++;
		summary.total += value;
		summary.sum_of_squares += Math.pow(value, 2);
		return summary;
	}, {
		total: 0,
		count: 0,
		min: 0,
		max: 0,
		sum_of_squares: 0
	});
};

Metric.prototype.seed = function() {};

Metric.prototype.add = function(value) {
	value = +value;
	if (isNaN(value)) {
		return;
	}
	this.values.push(value);
};

// normal method for putting a value in - "read" it - overloaded by certain metrics
Metric.prototype.read = Metric.prototype.add;

var TIMES = {
	sec: 1000,
	min: 60000,
	h: 3600000,
};
var getTimeUnit = /^[^\/]+\/(sec|min|h)/;

var Counter = exports.Counter = function(name, units) {
	Metric.call(this, name, units);
	var unit = getTimeUnit.exec(units);
	if (!unit) {
		throw new Error("Unit must be per second, minute or hour");
	}
	this.unitTime = TIMES[ unit[ 1 ] ];
	this.lastValue = 0;
};

Counter.prototype = Object.create(Metric.prototype);
Counter.prototype.constructor = Counter;

Counter.prototype.seed = function( value ) {
	this.lastValue = value;
	this.lastTime = Date.now();
};

Counter.prototype.read = function( value ) {
	value = +value || 0;
	var now = Date.now();
	var elapsed = (now - this.lastTime) / this.unitTime;
	var rate = (value - this.lastValue) / elapsed;
	this.lastValue = value;
	this.lastTime = Date.now();
	this.add( rate );
};
