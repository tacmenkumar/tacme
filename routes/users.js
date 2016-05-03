var express = require('express');
// var multer = require('multer')
var fs = require('fs');
var _ = require('underscore');

var db = require('../db.js');
var middleware = require('../middleware.js')(db);
// var utility = require('./app/utility.js');

var router = express.Router();

// var upload = multer({
// 	dest: __dirname + '/../uploads/'
// });

// function uploadCallback(req, res, next) {
// 	utility.saveFileToUploadDir(req.file.path, 'uploads/' + req.file.originalname, function() {
// 		fs.unlink(req.file.path);
// 		res.render('index', {
// 			title: "Hello"
// 		});
// 	}, function(err) {
// 		res.render('error');
// 	});
// };

// router.get('/', function(req, res, next) {
// 	res.render('demo', { title: 'TACME', username: null });
// }); 

// router.post('/', upload.single('filefield'), uploadCallback);

// Register a user
router.post('/register', function(req, res, next) {
	var body = _.pick(req.body, 'display_name', 'email', 'password', 'mobile_no', 'date_of_birth');
	console.log(body);
	if (typeof body.date_of_birth != 'undefined' && body.date_of_birth != null && body.date_of_birth != "") {
		var dobstr = body.date_of_birth.split('/');
		console.log(dobstr);
		body['date_of_birth'] = new Date(dobstr[2], (parseInt(dobstr[1]) - 1), parseInt(dobstr[0]));
		console.log(body);
	}

	db.user.create(body).then(function(user) {
		var success = _.extend(user.toPublicJSON(), {
			status: true
		});
		console.log(success);
		res.json(success);
	}, function(e) {
		var errors = _.extend(e, {
			status: false
		});
		console.log(e);
		res.status(201).json(errors);
	});
});

router.post('/login', function(req, res, next) {
	var body = _.pick(req.body, 'email', 'password');
	db.user.authenticate(body).then(function(user) {
		var success = _.extend(user.toPublicJSON(), {
			status: true,
			usertoken : user.generateToken('authentication')
		});

		res
			.header('Auth', user.generateToken('authentication'))
			.json(success);
	}, function(e) {
		var errors = _.extend(e, {
			status: false
		});
		res.status(201).json(errors);
	});
});

router.post('/forgot/password', function(req, res, next) {
	var body = _.pick(req.body, 'email');
	db.user.forgotPassword(body).then(function(user) {
		var success = _.extend(user, {
			status: true
		});
		res.json(success);
	}, function(e) {
		var errors = _.extend(e, {
			status: false
		});
		res.status(201).json(errors);
	});
});

router.post('/sync/contacts', middleware.requireAuthentication, function(req, res, next) {
	var body = _.pick(req.body, "userContacts");
	if(body["userContacts"].length > 0){
		db.user.syncContacts(body).then(function(syncedContacts){
			var success = _.extend(syncedContacts, {
				status: true
			});
			res.json(success);
		}, function(e){
			var errors = _.extend(e, {
				status: false
			});
			res.status(201).json(errors);
		});
	}else{
		var errors = {
				status: false,
				message: "Please add some value"
		};
		res.status(201).json(errors);
	}
	
});

module.exports = router;