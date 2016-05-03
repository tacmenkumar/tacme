var bcrypt = require('bcrypt');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function(sequelize, DataTypes) {
	var user = sequelize.define('user', {
		display_name: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				is: {
					args: [/^[a-z]+$/i],
					msg: "Display name can only contain letters."
				}
			},
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: {
					msg: "Please enter valid email id."
				},
				isUnique: function(value, next) {
					var self = this;
					user.find({
						where: {
							email: value
						}
					})
						.then(function(user) {
							// reject if a different user wants to use the same email
							if (user && self.id !== user.id) {
								return next(value + '\nis already in use. Please login or register with a different email id.');
							}
							return next();
						})
						.catch(function(err) {
							return next(err);
						});
				}
			}
		},
		salt: {
			type: DataTypes.STRING
		},
		password_hash: {
			type: DataTypes.STRING
		},
		password: {
			type: DataTypes.VIRTUAL, // Does not get stored on the database
			allowNull: false,
			validate: {
				len: {
					args: [8, 100],
					msg: "Password is too short. Please provide minimum 8 letters for password."
				},
				is: {
					args: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}/],
					msg: "Password must contain minimum 8 characters at least 1 uppercase letter, 1 lowercase alphabet, 1 number and 1 special character:"
				}
			},
			set: function(value) {
				var salt = bcrypt.genSaltSync(10);
				var hashedPassword = bcrypt.hashSync(value, salt);

				this.setDataValue('password', value);
				this.setDataValue('salt', salt);
				this.setDataValue('password_hash', hashedPassword);
			}
		},
		date_of_birth: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW
		},
		mobile_no: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isNumeric: {
					msg: "Please enter valid mobile number."
				}
			}
		}
	}, {
		hooks: {
			beforeValidate: function(user, options) {
				if (typeof user.email === 'string') {
					user.email = user.email.toLowerCase();
				}
			}
		},
		classMethods: {
			authenticate: function(body) {
				return new Promise(function(resolve, reject) {

					if (typeof body.email != 'string' ||
						typeof body.password != 'string') {
						return reject(body);
					}

					user.findOne({
						where: {
							email: body.email
						}
					}).then(function(user) {
						if (!user) {
							return reject({
								status: false,
								errors: [{
									message: "User not found."
								}]
							});
						} else if (!bcrypt.compareSync(body.password, user.get('password_hash'))) {
							return reject({
								status: false,
								errors: [_.extend(_.pick(user, 'display_name', 'email'), {
									message: "You have entered inccorrect password. Please try again."
								})]
							});
						}
						resolve(user);
					}, function(e) {
						reject(e);
					});
				});
			},
			forgotPassword: function(body){
				return new Promise(function(resolve, reject) {

					if (typeof body.email != 'string') {
						return reject(body);
					}

					user.findOne({
						where: {
							email: body.email
						}
					}).then(function(user) {
						if (!user) {
							return reject({
								status: false,
								errors: [{
									message: "User not found."
								}]
							});
						} else{
							var hashedPassword = user.get('password_hash');

							var bytes = cryptojs.AES.decrypt(hashedPassword, user.get('salt'));
							resolve({
								password: bytes.toString(cryptojs.enc.Utf8)
							});
						} 
					}, function(e) {
						reject(e);
					});
				});
			},
			syncContacts : function (body) {
				console.log(body.userContacts)
				 return new Promise(function (resolve, reject) {
				 	try {
				 		var values = _.map(body.userContacts, function(uc){
				 			return "(\'"+uc+"\')" 
				 		});

				 		var query = "WITH temporary_table (mobile_no) AS ( VALUES " + values.join(",") + " ) SELECT temporary_table.mobile_no, CASE WHEN users.mobile_no like temporary_table.mobile_no THEN true ELSE false END AS isPresent from temporary_table LEFT JOIN users ON users.mobile_no like temporary_table.mobile_no";
						sequelize.query(query, { type: sequelize.QueryTypes.SELECT})
						  .then(function(users) {
						    resolve(users);
						}, function(e){
							reject(e);
						});
 					} catch(e) {
						console.log(e);
						reject(e);
					}					
				 });
			},
			findByToken: function(token) {
				return new Promise(function(resolve, reject) {
					try {
						if (typeof token == 'undefined' || token == null || token == "") {
							reject();
						}
						var decodedJWT = jwt.verify(token, 'qwerty098');
						var bytes = cryptojs.AES.decrypt(decodedJWT.token, 'abc123@#!');
						var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

						user.findById(tokenData.id).then(function(user) {
							if (user) {
								resolve(user);
							} else {
								reject(user);
							}
						}, function(e) {
							reject(e);
						});
					} catch (e) {
						reject(e);
					}
				});
			}
		},
		instanceMethods: {
			toPublicJSON: function() {
				var json = this.toJSON();
				return _.omit(json, 'password', 'salt', 'password_hash');
			},
			generateToken: function(type) {
				if (!_.isString(type)) {
					return undefined;
				}

				try {
					var stringData = JSON.stringify({
						id: this.get('id')
					}, type)

					var encryptedData = cryptojs.AES.encrypt(stringData, 'abc123@#!').toString();
					var token = jwt.sign({
						token: encryptedData
					}, 'qwerty098');

					return token;
				} catch (e) {
					console.error("Error");
					console.log(e.message);
					return undefined;
				}
			}
		}
	});
	return user;
}