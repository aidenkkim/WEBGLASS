/*
* 데이터 스크래핑하여 Image Link Path, Alt 데이터 DB에 저장
* */

var cheerio = require('cheerio');
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
    console.log('Create Database Pool Successful')
    return dbPool;
}


/*
* html을 입력으로 받아 imagePath : alt Object return
* INPUT     :   Image URL, html Code
*/
var parseImgPath = function (url, html) {

    var images = {};
    var src = null;
    var alt = null;

    //JQuery 방식으로 DOM Control 하기 위해서 cheerio 사용
    var $ = cheerio.load(html);

    //imagesList 생성하여 images에 넣어줌
    //.each(JQuery) 사용하면 Synchronous 하게 이용 가능
    $('img').each(function (idx, item) {
        src = $(item).attr('src');
        alt = $(item).attr('alt');
            images[src] = alt;
    });

    //크롤링 데이터 Database에 저장
    saveScrapingAltData(images);

    console.log(images );
    console.log("끝");
}




/*
* 스크래핑한 데이터 저장
* * INPUT     :   Image URL
* */
var saveScrapingAltData = function (images) {
    pool().getConnection(function (err, conn) {                                     //Connection Pool에서 하나 연결
        if (err) {
            if (conn) {
                conn.release();
            }
            return;
        }
        console.log('Database Thread ID : ' + conn.threadId);


        //DB에 Bulk로 넣기 위해서 배열 형태로 변경
        //data.push([a,b]);
        var data = [];
        for(var i in images){
            data.push([i, images[i]]);
        }

        // SQL 문을 실행함
        // [data] 형태 중요!
        var exec = conn.query('INSERT into alt_list (path, alt) VALUES ?', [data], function (err, result) {
            conn.release();                                                               // Connection Pool 반드시 해제해야 함
            if (err) {
                console.log('saveScrapingAltData SQL Insert Error');
                console.error(err);
                return;
            }
        });
    });

}


module.exports.parseImgPath =parseImgPath;