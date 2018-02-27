(function() {

	'use strict';

	/* globals io, hubProxy */ //instruction for jshint

	//globals:
	//window.io is defined by socket.IO.
	//It represents the socket server.
	//io is a bit of a strange name, but it's being used in examples everywhere,
	//so let's stick to that.


	const body = document.body,
	      msg = document.getElementById('msg'),
	      msgList = document.getElementById('msg-list');

	/**
	* handle the new message being received from server
	* @param {object} evt The event coming from the socket server through the hubProxy
	* @returns {undefined}
	*/
	const messageHandler = function(evt) {
		const data = evt.detail;
		const newMsg = document.createElement('li');
		newMsg.textContent = data.msg + ' (from ' + data.id + ')';
		msgList.append(newMsg);
	};


	/**
	* handle submit of chat form
	* @param {event} evt - Submit event
	* @returns {undefined}
	*/
	const submitHandler = function(evt) {
		evt.preventDefault();
		const data = {
			msg: msg.value,
			id: io.id
		};
		window.hubProxy.sendEventToClients('chatmessage', data);

		msg.value = '';// empty field for next entry
	};
	


	/**
	* initialize chat form
	* @returns {undefined}
	*/
	const initChatForm = function() {
		document.getElementById('chat-form').addEventListener('submit', submitHandler);
	};
	


	/**
	* add listeners for body-events coming from the hub through the hubProxy
	* @returns {undefined}
	*/
	const initHubProxyListeners = function() {
		// add events you want to listen for, like this:
		body.addEventListener('chatmessage.hub', messageHandler);
	};


	
	/**
	* initialize this script when the hubProxy is ready
	* @param {string} varname Description
	* @returns {undefined}
	*/
	const init = function() {
		initChatForm();
		initHubProxyListeners();
	};

	
	// single point of entry: init when connection is ready
	if (window.hubProxy && window.hubProxy.isReady) {
		init();
	} else {
		body.addEventListener('hubready.hub', init);
	}

})();