const events = require('events');
const socketServer = require('../socket.io-server.js');
const ioEventBus = socketServer.nodeEventBus;// object to pass events to and from socket server
const hubProxy = new events.EventEmitter();// object to pass events to and from other node scripts; will be exported so scripts that require this very file can use it


/**
* send an event to the hub
* @param {string} eventName The name of the event to send
* @param {object} data The event's data
* @returns {undefined}
*/
const sendHubEvent = function(eventName, data) {
	// unlike on the frontend, this very script isn't a socket io can listen to
	// so we have a special object on io to emit events on
	ioEventBus.emit(eventName, data);
};


/**
* make the hub send an event to all clients
* @param {string} eventName The name of the event to send
* @param {object} data The event's data
* @returns {undefined}
*/
const sendEventToClients = function(eventName, eventData) {
	const data = {
		eventName,
		eventData
	};
	// trigger passthroughHandler on hub; hub will just forward it to all clients
	// unlike on the frontend, this isn't a socket io can listen to
	// so we have a special object on io to emit events on
	ioEventBus.emit('passthrough', data);
};


/**
* handle incoming event from hub
* @returns {undefined}
*/
const hubeventHandler = function(data) {
	const eventName = data.eventName + '.hub',
		eventData = data.eventData;

	// trigger the appropriate event
	hubProxy.emit(eventName, eventData);
};


/**
* initialize this app
* @returns {undefined}
*/
const init = function() {
	// listen for events coming from io
	ioEventBus.on('hubevent', hubeventHandler);

	// extend hubProxy object with methods
	hubProxy.sendEvent = sendHubEvent;
	hubProxy.sendEventToClients = sendEventToClients;

	exports.hubProxy = hubProxy;
};

init();
