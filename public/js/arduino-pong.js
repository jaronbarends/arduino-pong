(function() {

	'use strict';

	/* globals io, hubProxy */ //instruction for jshint
	
	//globals:
	//window.io is defined by socket.IO.
	//It represents the socket server.
	//io is a bit of a strange name, but it's being used in examples everywhere,
	//so let's stick to that.
	// hubProxy is defined in socket.io-hub-proxy.js

	const body = document.body,
		tickInterval = 25;
	
	
	const fieldElm = document.getElementById('field'),
		fcs = window.getComputedStyle(fieldElm),
		field = {
			width: parseInt(fcs.width, 10),
			height: parseInt(fcs.height, 10)
		};
	
	const scoreElm = document.getElementById('score');

	const barElm = document.getElementById('bar'),
		brcs = window.getComputedStyle(barElm),
		bar = {
			width: parseInt(brcs.width, 10),
			pos: {
				top: parseInt(brcs.top, 10),
				left: parseInt(brcs.left, 10),
				tx: 0,
				ty: 0
			},
			lastMove: {
				dx: 0,
				ts: 0// timestamp of last move
			}
		};
	bar.range = {
		x: field.width - bar.width
	};


	const ballElm = document.getElementById('ball'),
		blcs = window.getComputedStyle(ballElm),
		ball = {
			width: parseInt(blcs.width, 10),
			height: parseInt(blcs.height, 10),
			startSpeed: 6,
			minSpeed: 2
		};
	ball.range = {
		x: field.width - ball.width
	};


	/**
	* handle someEvent coming from socket
	* @param {CustomEvent} evt - The event coming from the socket through the hubProxy
	* @returns {undefined}
	*/
	const buttonDownHandler = function(evt) {
		console.log('start');
		start();
	};

	/**
	* handle new knob value
	* @returns {undefined}
	*/
	const knobHandler = function(evt) {
		const currTx = bar.pos.tx,
			newTx = Math.floor(bar.range.x * evt.detail.value),
			dx = newTx - currTx;
			// tickInterval is same as knob-frequency, so
			// this dx is the distance moved within the last tick
		// store last move
		bar.lastMove = {
			dx,
			ts: Date.now()
		};
		bar.pos.tx = newTx;
		barElm.style.transform = 'translateX(' + bar.pos.tx + 'px)';
	};

	/**
	* initialize ball
	* @returns {undefined}
	*/
	const initBall = function() {
		const randomX = Math.floor(ball.range.x * (0.1 + 0.8 * Math.random()));//between 0.1 and 0.9
		ballElm.style.transform = 'translate(' + randomX + 'px, 0)';
		ball.pos = {
			tx: randomX,
			ty: 0
		};
		ball.speed = {
			x: ball.startSpeed,
			y: ball.startSpeed
		};
	};

	/**
	* make led blink
	* @returns {undefined}
	*/
	const blinkLed = function(color, duration) {
		window.hubProxy.sendEventToClients('startledblink', {color, duration});
	};
	

	/**
	* check if ball bumps on bar
	* @returns {undefined}
	*/
	const barIsInPlace = function(newX) {
		let isInPlace = false,
			ledColor = 'red';
		if (newX > (bar.pos.tx - ball.width) && newX < (bar.pos.tx + bar.width)) {
			isInPlace = true;
		}
		
		return isInPlace;
	};
	

	/**
	* do loop-tick
	* @returns {undefined}
	*/
	const tick = function() {
		let stillAlive = true;
		let newX = ball.pos.tx + ball.speed.x,
			newY = ball.pos.ty + ball.speed.y;

		if (newX < 0) {
			newX = -1*newX;
			ball.speed.x = -ball.speed.x;
		} else if (newX > ball.range.x) {
			newX = 2 * ball.range.x - newX;
			ball.speed.x = -ball.speed.x;
		}

		const maxY = bar.pos.top - ball.height;
		if (newY < 0) {
			newY = -1*newY;
			ball.speed.y = -ball.speed.y;
		} else if (newY > maxY) {
			// it's at the bottom - check for collision with bar
			let ledColor = 'green';
			if (barIsInPlace(newX)) {
				const score = parseInt(scoreElm.textContent, 10) +1;
				setScore(score);
				
				ball.speed.y = -ball.speed.y;
				newY = 2 * maxY - newY;
				ball.speed.y *= 1.05;

				const now = Date.now();
				if ( (now - bar.lastMove.ts) < 100) {
					// bar was moving (recently), so adjust speed.x
					ball.speed.x += bar.lastMove.dx/4;
					// make sure speed doesn't get too small
					if (ball.speed.x >= 0) {
						ball.speed.x = Math.max(ball.minSpeed, ball.speed.x);
					} else {
						ball.speed.x = Math.min(-ball.minSpeed, ball.speed.x);
					}
				}
			} else {
				// loose a life
				stillAlive = false;
				ledColor = 'red';
			}
			blinkLed(ledColor, 500);
		}
		ball.pos.tx = newX;
		ball.pos.ty = newY;

		ballElm.style.transform = 'translate(' + ball.pos.tx + 'px, ' + ball.pos.ty + 'px)';
		if (stillAlive) {
			setTimeout(tick, tickInterval);
		}
	};

	/**
	* set the score
	* @returns {undefined}
	*/
	const setScore = function(points) {
		score.textContent = points;
	};
	
	
	/**
	* start game loop
	* @returns {undefined}
	*/
	const start = function() {
		setScore(0);
		initBall();
		tick();
	};
	

	/**
	* add listeners for body-events coming from the hub through the hubProxy
	* @returns {undefined}
	*/
	const initHubProxyListeners = function() {
		// example code:
		body.addEventListener('buttonDown.j5.hub', buttonDownHandler);
		body.addEventListener('knob.j5.hub', knobHandler);
		// body.addEventListener('boardready.j5.hub', start);
	};


	/**
	* initialize this script when the hub-proxy is ready
	* @returns {undefined}
	*/
	const init = function() {
		initHubProxyListeners();

		document.getElementById('restart').addEventListener('click', (evt) => {
			evt.preventDefault();
			window.hubProxy.sendEventToClients('boardready.j5');
		});
	};



	// single point of entry: init when connection is ready	
	if (window.hubProxy && window.hubProxy.isReady) {
		init();
	} else {
		body.addEventListener('hubready.hub', init);
	}

})();