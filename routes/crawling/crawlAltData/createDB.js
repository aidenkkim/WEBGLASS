
var mysql = require('mysql');
var config = require('../../../config');

//Database 설정
var pool = function () {
    var dbPool = mysql.createPool({
        connectionLimit: 10,
        host: config.db_host,
        user: config.db_user,
        password: config.db_passwd,
        port: config.db_port,
        database: config.database
    });
    console.log('Create Database Pool Done')
    return dbPool;
}


module.exports.pool = pool;