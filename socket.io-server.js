// This is the server-side file of the socket server implementation
// It initializes socket.io and a new express instance.
// Start it by running 'node socket.io-server' from your terminal.


// Define global vars
let express,
	app,
	port,
	io,
	clients,
	clientList = {};
	
const events = require('events'),
	nodeEventBus = new events.EventEmitter();// object to communicate events to and from other node scripts


/**
* initialize basic requirements for the server
* @returns {undefined}
*/
const initBasicRequirements = function() {

	//create express server
	express = require('express');
	app = express();

	//set port that we'll use
	port = process.env.PORT || 3000;// This is needed if the app is run on heroku and other cloud providers

	// Initialize a new socket.io object. It is bound to 
	// the express app, which allows them to coexist.
	io = require('socket.io').listen(app.listen(port));

	// Make the files in the public folder available to the world
	app.use(express.static(__dirname + '/public'));

	
};



/**
* handle event that just has to be passed through to all frontend socket-clients and node scripts
* this way, we don't have to add listeners for and handle specific events separately
* @param {object} data Object containing {string} eventName and [optional {object} eventData]
* @returns {undefined}
*/
const passThroughHandler = function(data) {
	const eventName = data.eventName;
	if (eventName) {
		clients.emit('hubevent', data);// hub-client-socketIO.js will pick this up and fire body event eventName+'.hub'
		nodeEventBus.emit('hubevent', data);// socket-io-node-bridge.js will pick this up and emit event eventName+'.hub'
	}
};


/**
* initialize connections to clients
* @returns {undefined}
*/
const initClientConnections = function() {
	clients = io.on('connect', function (socket) {
		// A new client has come online; send it a connectionready event
		socket.emit('connectionready');
		clientList[socket.id] = socket;
		// console.log(socket.id);
		// console.log(io.sockets.clients());

		socket.on('disconnect', function(e) {
			// console.log('disconnect', e);
			// clientList[socket.id].off('passthrough');
		});

		//set handler for events that only have to be passsed on to all sockets
		socket.on('passthrough', passThroughHandler);// coming from frontend
		nodeEventBus.on('passthrough', passThroughHandler);// coming from node scripts
	});
};





/**
* Initialize everything
* @param {string} varname Description
* @returns {undefined}
*/
const init = function() {
	initBasicRequirements();
	initClientConnections();
	console.log('Server now running on http://localhost:' + port);

	exports.nodeEventBus = nodeEventBus;
};


// kick things off
init();
