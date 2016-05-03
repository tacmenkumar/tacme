var Sequelize = require('sequelize');
// var env = 'production';
var env = 'development';
var sequelize;

if(env === 'production'){
	console.log('1connecting to databse in heroku');
	sequelize = new Sequelize('postgres://cnhalpbaygixbq:XOD2WObhEjdOOQYpAN5osYkwT5@ec2-54-243-63-195.compute-1.amazonaws.com:5432/d905npbrc1ccs');
}else{
	console.log('2connecting to databse in local');
	sequelize = new Sequelize('postgres://postgres:nk@localhost:5433/tacme?ssl=true');	
}

sequelize.authenticate()
    .then(function () {
        console.log("CONNECTED! ");
    })
    .catch(function (err) {
        console.log("SOMETHING DONE GOOFED");
        console.log(err);
    })
    .done();


var db = {};
db.user = sequelize.import(__dirname + '/models/users.js'); 

db.sequelize = sequelize;  

module.exports = db;