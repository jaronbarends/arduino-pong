// potentiometer:
// ground somewhere
// one on 5v
// one on A2

const nodeBridge = require('./socket.io-node-bridge.js');
const hubProxy = nodeBridge.hubProxy;
const five = require('johnny-five');
const leds = {};


/**
* handle led toggle
* @returns {undefined}
*/
const ledHandler = function(data) {
	const led = new five.Led(8);

	if (data.isOn) {
		led.on();
	} else {
		led.off();
	}
};

/**
* initialize leds
* @returns {undefined}
*/
const initLeds = function() {
	leds.red = new five.Led(7);
	leds.green = new five.Led(8);
};


/**
* initialize button
* @returns {undefined}
*/
const initButton = function() {
	const button = new five.Button({
		pin: 11,
		isPullup: true
	});

	button.on('down', () => {
		const data = {
			pin: 11
		};
		hubProxy.sendEventToClients('buttonDown.j5', data);
	});
};

/**
* initialize turning knob (potentiometer)
* @returns {undefined}
*/
const initKnob = function() {
	// Create a new `potentiometer` hardware instance.
	const potentiometer = new five.Sensor({
		pin: "A2",
		freq: 25,
		treshold: 10
	});

	console.log('value:', potentiometer.value);

	let lastValue = null,
		maxValue = 1023;

	// "data" get the current reading from the potentiometer
	potentiometer.on("data", function() {
		const value = this.value;
		if (value !== lastValue) {
			lastValue = value;
			// console.log(this.value, this.raw);
			const ratio = value/maxValue;
			hubProxy.sendEventToClients('knob.j5', {value: ratio});
		}
	});
};

/**
* handle incoming start blink event
* @returns {undefined}
*/
const blinkHandler = function(data) {
	const led = leds[data.color];
	if (led) {
		led.on();
		setTimeout(() => {led.off();}, data.duration);
	}
};




/**
* initialize johnny-five
* @returns {undefined}
*/
const initFive = function() {
	initButton();
	initKnob();
	initLeds();
	hubProxy.sendEventToClients('boardready.j5');
	console.log('Arduino is ready');
};


/**
* initialize this app
* @returns {undefined}
*/
const init = function() {
	five.Board().on('ready', initFive);
	hubProxy.on('led.hub', ledHandler);
	hubProxy.on('startledblink.hub', blinkHandler);
};

init();
