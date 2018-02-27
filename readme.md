# websocket basics

Basic implementation of letting a browser window send events to another browser window through web sockets.

Uses express node-server in combination with socket.io.

## Getting started

Make sure you have [_node.js_](https://nodejs.org/en/) installed.

### Install socket library

In the root _src_ directory (the same directory where this readme.md is located), install the socket library:
````
npm install
````

### Start the socket-server:
````
node socket.io-server.js
````

(or double click the batch script _START-SOCKET.IO-SERVER_, which executes the same command)

You'll now have a webserver running on http://localhost:3000. The socket-server serves files in the _public_ directory and handles traffic between sockets. Sockets can send events to the socket-server, and the socket-server sends some of its own events to the sockets. A very basic example chat application is included in the repo; check it at http://localhost:3000/chat-example.html.

### Add scripts to html

At the end of every html page you want to work as a socket client, include the [_socket.io_](https://socket.io/) library and the hub-proxy:
````html
<script src="/socket.io/socket.io.js"></script>
<script src="js/socket.io-hub-proxy.js"></script>
````

### Create javascript functionality

For your own page functionality, you can use _js/template.js_ as a starting point. It should be included after the two aforementioned scripts.

Check if the hubProxy is ready before initializing your functionality:
````javascript
if (window.hubProxy && window.hubProxy.isReady) {
    init();
} else {
    body.addEventListener('hubready.hub', init);
}
````

You can make the script send events to all clients (including the script itself)
````javascript
const data = {foo: bar};
window.hubProxy.sendEventToClients('someEventName', data);
````
This sends an event to the socket server, which then sends it back to all socket clients

To make a script listen to that event:
````javascript
body.addEventListener('someEventName.hub', (evt) => {
    console.log('event data:', evt.detail);
}));
````

### Using another Node script

In your node script (let's call it app.js), require the node bridge, and create a variable for its ``hubProxy`` object:
````javascript
const nodeBridge = require('./socket.io-node-bridge.js');
const hubProxy = nodeBridge.hubProxy;
````

Send events to all clients:
````javascript
const data = {foo: bar};
hubProxy.sendEventToClients('someEventName', data);
````
This sends an event to the socket server, which then sends it back to all socket clients (both frontend and backend)

To make a script listen to that event:
````javascript
hubProxy.on('someEventName.hub', (data) => {
    console.log('data:', data);
}));
````