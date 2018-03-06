/*
* proxy for the sockets-hub.
* Every page that acts a socket-client needs to have one hub-proxy
* for communication between socket.io and page scripts
*/
;window.hubProxy = (function() {

	'use strict';

	/* global io */ //global io is defined by socket.io

	//define semi-globals (variables that are "global" in this file's anounymous function's scope)
	//prefix them with sg so we can distinguish them from normal function-scope vars
	const sgBody = document.body;
	let sgIsReady = false;


	/**
	* send an event to the hub
	* @param {string} eventName The name of the event to send
	* @param {object} data The event's data
	* @returns {undefined}
	*/
	const sendHubEvent = function(eventName, data) {
		io.emit(eventName, data);
	};

	
	/**
	* send an event to the hub to have it passed on to all clients
	* @param {string} eventName The name of the event to send
	* @param {object} data The event's data
	* @returns {undefined}
	*/
	const sendEventToClients = function(eventName, eventData) {
		const data = {
			eventName,
			eventData
		};
		// send passthrough-event to hub; hub will just forward it to all clients
		// where it is picked up by hubeventHandler, which then triggers it as an event on the body
		io.emit('passthrough', data);
	};



	/**
	* get this hub client's id
	* id is still undefined upon returning the iife, so we need to expose this method to other scripts
	* @returns {string} This hub client's id
	*/
	const getId = function() {
		return io.id;
	};

	/**
	* handle incoming event from hub
	* @returns {undefined}
	*/
	const hubeventHandler = function(data) {
		const eventName = data.eventName + '.hub',
			eventData = data.eventData;

		// trigger the appropriate event from the body
		const evt = new CustomEvent(eventName, { detail: eventData });
		sgBody.dispatchEvent(evt);
	};
	
	

	/**
	* initialize all
	* @returns {object} Object with public methods for hub-client
	*/
	const init = function() {

		document.addEventListener('DOMContentLoaded', function() {
			io = io();
			io.on('connectionready', () => {
				sgIsReady = true;
				const evt = new CustomEvent('hubready.hub');
				sgBody.dispatchEvent(evt);
				// console.log(io.id);
			});
			io.on('hubevent', hubeventHandler);

			// window.addEventListener('beforeunload', () => {
			// 	// io.off('hubevent', hubeventHandler);
			// 	io.disconnect();
			// });
		});


		// return public functions and vars
		return {
			getId: getId,
			sendEvent: sendHubEvent,
			sendEventToClients: sendEventToClients,
			isReady: sgIsReady
		};
	};


	// single point of code entry
	return init();

})();
