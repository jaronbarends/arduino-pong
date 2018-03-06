/*
* show the id of this page's socket connection
*/
;(function() {

	'use strict';

	/* global io */ //instruction for jshint

	//globals:
	//window.io is defined by socket.IO.
	//It represents the socket server.
	//io is a bit of a strange name, but it's being used in examples everywhere,
	//so let's stick to that.

	const body = document.body;

	/**
	* initialize the remote
	* @returns {undefined}
	*/
	const init = function() {
		const elm = document.querySelector('#id-box .user-id');
		if (elm) {
			elm.textContent = window.hubProxy.getId();
		}
	};


	// single point of entry: init when connection is ready	
	if (window.hubProxy && window.hubProxy.isReady) {
		init();
	} else {
		body.addEventListener('hubready.hub', init);
	}
})();