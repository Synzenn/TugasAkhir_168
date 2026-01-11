const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('db_tmdb_project', 'root', 'Velascoggbanget1', {
    host: 'localhost',
    dialect: 'mysql',
    port: '3309'
});

module.exports = sequelize;