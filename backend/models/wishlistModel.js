const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Wishlist = sequelize.define('Wishlist', {
    movieId: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    userApiKey: { type: DataTypes.STRING, allowNull: false }
});

module.exports = Wishlist;