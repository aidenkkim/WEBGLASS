var config = require('../config');
var mysql = require('mysql');

var pool = function () {
    var dbPool = mysql.createPool({
        connectionLimit: 10,
        host: config.db_host,
        user: config.db_user,
        password: config.db_passwd,
        port: config.db_port,
        database: config.database
    });
    console.log('database pool 생성 완료')
    return dbPool;
}


//데이터 베이스에서 images의 path를 검색하여 {imagePath : alt} 형태로 return. 글씨가 없는 경우 alt=0;
var searchImage = function (images, callback) {
    pool().getConnection(function (err, conn) {                                     //Connection Pool에서 하나 연결
        if (err) {
            if (conn) {
                conn.release();
            }
            return;
        }
        console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);

        var data = {};

        // SQL 문을 실행함
        var exec = conn.query('SELECT * FROM image', data, function (err, result) {
            conn.release();                                                               // Connection Pool 반드시 해제해야 함
            if (err) {
                console.log('SQL 실행 시 에러 발생함.');
                console.dir(err);
                return;
            }
            for (var i in images) {                                                         //html에서 추출한 각각의 image들에 대해서 DB에 존재하는지 확인
                result.every(function(item, idx){                                           //every는 forEach와 같은 쓰임인데, return false하면 break 됨
                    if(item.image_path == i ){
                        images[i] = item.image_content;
                        return false;                                                       //DB에서 찾으면, alt 값을 적용하고 break;
                    }else{
                        images[i] = 0;
                    }
                });
            }

            callback(images);
        });
    });

}


//이미지 분석 결과 저장
var saveImgInfo = function (path, localPath, analyzedAlt) {


}


module.exports.searchImage = searchImage;
module.exports.saveImgInfo = saveImgInfo;