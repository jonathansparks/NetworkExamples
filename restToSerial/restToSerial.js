/*
	restToSerial.js
	a node.js app to read take requests and send as serial data
	requires:
		* node.js (http://nodejs.org/)
		* express.js (http://expressjs.com/)
		* socket.io (http://socket.io/#how-to-use)
		* serialport.js (https://github.com/voodootikigod/node-serialport)
		
	based on the core examples for socket.io and serialport.js
		
	created 5 Nov 2012
	by Tom Igoe
	
*/


var serialport = require("serialport"),				// include the serialport library
	SerialPort  = serialport.SerialPort,			// make a local instance of serial
	app = require('express')(),						// start Express framework
  	server = require('http').createServer(app),		// start an HTTP server
  	io = require('socket.io').listen(server);		// filter the server using socket.io

var serialData;								// object to hold what goes out to the client

server.listen(8080);								// listen for incoming requests on the server

console.log("Listening for new clients on port 8080");

// open the serial port. Change the name to the name of your port, just like in Processing and Arduino:
var myPort = new SerialPort("/dev/cu.usbmodem241331", { 
	// look for return and newline at the end of each data packet:
	parser: serialport.parsers.readline("\r\n") 
});
  
// respond to web GET requests with the index.html page:
app.get('/', function (request, response) {
  response.sendfile(__dirname + '/index.html');
});


app.get('/output*', function (request, response) {
  var params = request.params[0].split("/");
  var stringToSend = params.join("");
  myPort.write(stringToSend);
  response.writeHead(200, {'Content-Type': 'text/html'});
  response.end("you sent " + stringToSend);
});

// listen for new socket.io connections:
io.sockets.on('connection', function (socket) {
	// if there's a socket client, listen for new serial data:  
	myPort.on('data', function (data) {
		// Convert the string into a JSON object:
		serialData = JSON.parse(data);
		// for debugging, you should see this in Terminal:
		console.log(data);
		// send a serial event to the web client with the data:
		socket.emit('serialEvent', serialData);
	});
});