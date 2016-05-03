var Sequelize = require('sequelize');
var env = 'production';
// env = 'development';
var sequelize;
try {
	if(env === 'production'){
		console.log('connecting to databse in heroku');
		sequelize = new Sequelize('postgres://hovvfctniqxjxf:JjTtEuJDGOzmi9S9iC49pwML-0@ec2-54-163-225-208.compute-1.amazonaws.com:5432/dcgaahifmes9h4');
	}else{
		console.log('connecting to databse in local');
		sequelize = new Sequelize('postgres://postgres:nk@localhost:5433/tacme?ssl=true');	
	}

	sequelize.authenticate()
	    .then(function(success) {
	    console.log('----------------------------- Database Connection Established Successfully. ---------------------------------')
	  }, function (err) { 
	    console.log('----------------------------- err in catch begin ---------------------------------')
	    console.log(err);
	    console.log('----------------------------- err end ---------------------------------')
	  }).catch(function (err) {
	        console.log('----------------------------- err in catch begin ---------------------------------')
	        console.log(err);
	        console.log('----------------------------- err in catch end ---------------------------------')
	    })
	    .done();
	var db = {};
	db.user = sequelize.import(__dirname + '/models/users.js'); 

	db.sequelize = sequelize;  
} catch(e) {
	console.log(e);
}


module.exports = db;