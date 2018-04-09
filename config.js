module.exports = {
    server_port: 3000,
    db_host: '125.131.73.28',
    db_user: 'root',
    db_passwd: 'root',
    db_port:'53306',
    database:'sys',
    route_info: [
        //===== User =====//
        {file:'./index', path:'/a', method:'test', type:'get'},
        {file:'./user', path:'/process/login', method:'login', type:'post'}					// user.login
    ]
}