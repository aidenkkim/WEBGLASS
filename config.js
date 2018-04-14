module.exports = {
    server_port: 3000,
    db_host: '125.131.73.28',
    db_user: 'root',
    db_passwd: 'root',
    db_port:'53306',
    database:'webglass',
    route_info: [
        //===== User =====//
        {file:'./main', path:'/', method:'main', type:'get'},
    ]
}