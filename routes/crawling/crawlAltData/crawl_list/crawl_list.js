var cheerio = require('cheerio');


var config = require('../../../../config');
var mysql = require('mysql');


//이미지 안에 글씨가 포함되지 않는 경우 표시되는 alt 문구 포맷
const DEFAULTALT = '글이 포함되지 않은 이미지 입니다.';

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


var linkList = function (status, callback) {
    //Connection Pool에서 하나 연결
    pool().getConnection(function (err, conn) {
        if (err) {
            if (conn) {
                conn.release();
            }
            return;
        }
        console.log('Database Thread ID : ' + conn.threadId);

        var data = {};
        // SQL 문을 실행함
        var exec = conn.query('SELECT * FROM top10_link WHERE status='+status, data, function (err, result) {
            // Connection Pool 반드시 해제해야 함
            if (err) {
                console.log('linkList Method SQL Error');
                console.dir(err);
                return;
            }
            callback(result);
        });
        var exec = conn.query('UPDATE top10_link SET status = '+ (status+1) +' WHERE status='+status, data, function (err, result) {
            // Connection Pool 반드시 해제해야 함
            conn.release();
            if (err) {
                console.log('linkList update status SQL Error');
                console.dir(err);
                return;
            }
        });
        var a=null;
    });
}

var saveCrawlList = function (link) {

    //Connection Pool에서 하나 연결
    pool().getConnection(function (err, conn) {
        if (err) {
            if (conn) {
                conn.release();
            }
            return;
        }
        console.log('Database Thread ID : ' + conn.threadId);


        // SQL 문을 실행함
        var exec = conn.query('INSERT into crawl_link (company, link, status) VALUES ? ', [link], function (err, result) {
            // Connection Pool 반드시 해제해야 함
            conn.release();
            if (err) {
                console.log('saveCrawlList SQL Insert Error');
                console.error(err);
                return;
            }
        });
    });

}


var extractTop10 = function (html, callback) {
    extractClass(html, 'best-classifieds', function (bestClassHTML) {
        var arr = [];
        var $ = cheerio.load(bestClassHTML);
        var count = 0;
        //Image Object Map 생성
        $('a').each(function (idx, item) {
            if (count == 20) return false
            var href = $(item).attr('href');
            var href2 = href.split(",")
            var res = href2[5].split("'");
            arr.push(['G마켓', res[1], 0]);
            count++;
        });
        callback(arr);
    });
}


var extractClass = function (html, className, callback) {
    var $ = cheerio.load(html);
    var result = $('.'+className).html();
    callback(result);
}


module.exports.saveCrawlList = saveCrawlList;
module.exports.extractTop10 = extractTop10;
module.exports.linkList = linkList;