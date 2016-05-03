var db = require('./db.js');
var _ = require('underscore');

/**
 * Show the console log
 * @param  {Object} msg    Message to show may be an object/string or any other datatype
 * @param  {String} header Header to show as title of the log
 */
function logger(msg, header) {
	console.log("<<---------------------" + header + "---------------------->>");
	console.log(msg);
	console.log("<<--------------------------------------------------------->>");
}

/**
 * Register user to the databse
 * @param  {Object} userinfo Contains userinformation like email id, password, date of birth, gender, socket id
 */
function registerUser(userinfo,socket) {
	db.user.create(userinfo).then(function(user) {
		logger(user, "Register User")
		socket.emit("register_success", {
			isregistered: true
		});
	}, function(e) {
		logger(e, "Error Registering User");
		socket.emit("register_error", e);
	});
}

/**
 * Called on receiving any message from the client socket
 * @param  {Object} data   Message Body
 * @param  {Object} socket Socket
 */
function messageReceived(data, socket) {
	console.log("Message: " + data.message);
	socket.emit("message", {
		id: data.id,
		message: data.message
	});
}


/**
 * Initialize socket communication
 * @param  {[type]} server Server Object
 */
exports.initSocket = function(server) {
	var io = require('socket.io').listen(server);
	// Called on connection to server from the client
	io.on('connect', function(socket) {
		logger(socket.id, 'Connect');

		socket.on('register', function(userinfo) {
			userinfo = _.extend(userinfo, {
				socket_id: socket.id
			});
			registerUser(userinfo, socket);
		});

		socket.on('message', function(data) {
			messageReceived(data, socket);
		});

		socket.on('disconnect', function(e) {
			logger(socket.id, 'Disconnect');
		});

	});
};