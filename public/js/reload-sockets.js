/*
* functionality for reloading all connected sockets
*/
(function() {

	'use strict';

	/* global io */ //instruction for jshint

	//globals:
	//window.io is defined by socket.IO.
	//It represents the socket server.
	//io is a bit of a strange name, but it's being used in examples everywhere,
	//so let's stick to that.

	const body = document.body;


	/**
	* handle the orientation change of one of the remote devices
	* @param {object} data Data sent by remote.js's tiltchange event
	* @returns {undefined}
	*/
	var reloadAllHandler = function(data) {
		window.location.reload();
	};


	/**
	* initialize reload all link - if it's present
	* @returns {undefined}
	*/
	const initReloadLink = function() {
		const reloadLink = document.getElementById('reload-all-sockets');
		if (reloadLink) {
			reloadLink.addEventListener('click', (e) => {
				e.preventDefault();
				window.hubProxy.sendEventToClients('reloadall')
			});
		}
	};
	

	/**
	* add listeners for body-events coming from the hub through the hubProxy
	* @returns {undefined}
	*/
	const initHubProxyListeners = function() {
		// add events you want to listen for, like this:
		// io.on('chatmessage', messageHandler);
		body.addEventListener('reloadall.hub', reloadAllHandler);
	};

	
	/**
	* initialize this script when the hubProxy is ready
	* @param {string} varname Description
	* @returns {undefined}
	*/
	var init = function() {
		initReloadLink();
		initHubProxyListeners();
	};

	

	// single point of entry: init when connection is ready	
	if (window.hubProxy && window.hubProxy.isReady) {
		init();
	} else {
		body.addEventListener('hubready.hub', init);
	}

})();