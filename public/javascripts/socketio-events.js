// Create socket connection
var socket = io();

console.log(socket);

function trimstring(str, defaultValue) {
	if (typeof str === 'undefined' || str == null || str == "") {
		defaultValue = "";
	}
	if (typeof str === 'undefined' || str == null || str == "") {
		return defaultValue;
	} else if (typeof str.trim === 'function') {
		return str.trim();
	} else {
		return str;
	}
}

// Called on connect to server
socket.on('connect', function(data) {
	console.log("Server Connected...");
});

socket.on('message', function(data) {
	$("#message_list").append('<li><p>' + data.message + '</p></li>');
	$("#message_list_container").scrollTop($("#message_list_container")[0].scrollHeight);
	if ($("#message_list_container")[0].scrollHeight > 200) {
		$("#message_list_container").css("overflow-y", "scroll");
	}
});

socket.on('register_success', function(data) {
	$("#message_list_container").css("visibility", "visible");
	$("#send_button").val("Send");
	$("#user_box").hide();
});

socket.on('register_error', function(data) {
	alert("Error while registering...");
	console.log(data);
});


function sendMessage() {
	var message = trimstring($("#message_textbox").val());
	if (message === "") {
		alert("Please enter some message.");
	} else {
		$("#message_textbox").val('');
		socket.emit("message", {
			id: 1,
			message: message
		});

	}
}

function sendRegisterRequest() {
	var requestobj = {
		email: trimstring($("#email_textbox").val(), ""),
		password: trimstring($("#email_textbox").val(), ""),
		date_of_birth: trimstring($("#date_of_birth_textbox").val(), ""),
		gender: trimstring($("input[type='radio'].radio_gender:checked").val())
	}

	console.log(requestobj);

	if (requestobj.email === "") {
		alert("Please enter email id.");
	} else if (requestobj.password === "") {
		alert("Please enter password.");
	} else if (requestobj.date_of_birth === "") {
		alert("Please enter date of birth");
	} else if (requestobj.gender === "") {
		alert("Please select your gender.");
	} else {
		socket.emit("register", requestobj);
	}
}

function sendRequest() {
	console.log($("#message_list_container").css("visibility"));
	if ($("#message_list_container").css("visibility") === 'hidden') {
		sendRegisterRequest();
	} else {
		sendMessage();
	}
}