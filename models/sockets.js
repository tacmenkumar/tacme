var _ = require('underscore');

module.exports = function(sequelize, DataTypes) {
	var socket = sequelize.define('user', {
			socket_id: {
				type: DataTypes.STRING,
				allowNull: false
			},
			ip: {
				type: DataTypes.STRING,
				allowNull: false
			}
		}
	});
return socket;
}