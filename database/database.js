
/*
 * 데이터베이스 스키마 로딩
 * 기본 파일이며 개발자 수정 필요없음
 *
 * @date 2016-11-10
 * @author Mike
 */

var mysql = require('mysql');
var database = {};

// 초기화를 위해 호출하는 함수
database.init = function(app, config) {
    console.log('init() 호출됨.');

    connect(app, config);
}

//데이터베이스에 연결하고 응답 객체의 속성으로 db 객체 추가
function connect(app, config) {
    console.log('connect() 호출됨.');

    database.db = mysql.createConnection({
        host:config.db_host,
        user:config.db_user,
        password:config.db_passwd,
        port:config.db_port,
        database:config.database
    });

    database.db.connect();
    // 데이터베이스 연결 : config의 설정 사용
        console.log('데이터베이스에 연결되었습니다. : ' + config.db_host);
        app.set('database',database);
}


// database 객체를 module.exports에 할당
module.exports = database;
