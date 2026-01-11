const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const { v4: uuidv4 } = require('uuid');

const User = sequelize.define('User', {
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('admin', 'user'), defaultValue: 'user' },
    apiKey: { type: DataTypes.STRING, defaultValue: () => uuidv4() }
});

module.exports = User;