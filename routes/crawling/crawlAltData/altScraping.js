/*
* 데이터 스크래핑하여 Image Link Path, Alt 데이터 DB에 저장
* */

var cheerio = require('cheerio');
var createDB = require('./createDB');


//DB에서 가져와 Scraping 할 Page 수
const SCRAPING_NUM = 5000;
const DOWNLOAD_NUM = 100;

/*
* html을 입력으로 받아 imagePath : alt Object return
* INPUT     :   Image URL, html Code
*/
var parseImgPath = function (html, callback) {

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

        console.log('Extract Image Alt Text');
    });

    var data = [];
    for (var i in images) {
        data.push([i, images[i]]);
    }
    callback(data);
}


var linkList = function (status, callback) {
    //Connection Pool에서 하나 연결

    createDB.pool().getConnection(function (err, conn) {
        if (err) {
            if (conn) {
                conn.release();
            }
            return;
        }
        var data = {};

        // SQL 문을 실행함
        var query = null;
        if (status == 0) {
            query = 'SELECT * FROM crawl_link WHERE status=' + status + ' limit '+DOWNLOAD_NUM;
        } else if (status == 1) {
            query = 'SELECT * FROM crawl_link WHERE status=' + status + ' limit ' + SCRAPING_NUM;
        }
        var exec = conn.query(query, data, function (err, result) {
            // Connection Pool 반드시 해제해야 함
            if (err) {
                console.log('linkList Method SQL Error');
                console.dir(err);
                return;
            }
            console.log('Bring Crawl Link Status ' + status + ' || Total : ' + result.length)
            callback(result);
        });

        var query2 = null;
        if (status == 0) {
            query2 = 'UPDATE crawl_link SET status = ' + (status + 1) + ' WHERE status=' + status + ' limit '+DOWNLOAD_NUM;
        } else if (status == 1) {
            query2 = 'UPDATE crawl_link SET status = ' + (status + 1) + ' WHERE status=' + status + ' limit ' + SCRAPING_NUM;
        }
        var exec = conn.query(query2, data, function (err, result) {
            // Connection Pool 반드시 해제해야 함
            conn.release();
            if (err) {
                console.log('linkList Status Update SQL Error');
                console.dir(err);
                return;
            }
            console.log('Update Crawl Link Status to ' + (status + 1) + ' || Total : ' + result.affectedRows);
        });


    });
}




/*
* 스크래핑한 데이터 저장
* * INPUT     :   Image URL
* */
var saveScrapingAltData = function (images) {
    createDB.pool().getConnection(function (err, conn) {                                     //Connection Pool에서 하나 연결
        if (err) {
            if (conn) {
                conn.release();
            }
            return;
        }

        // SQL 문을 실행함
        // [data] 형태 중요!
        var exec = conn.query('INSERT into alt_list (path, alt) VALUES ?', [images], function (err, result) {
            conn.release();                                                               // Connection Pool 반드시 해제해야 함
            if (err) {
                console.log('saveScrapingAltData SQL Insert Error');
                console.error(err);
                return;
            }
            console.log('Save Extracted Alt Text Done');

        });
    });

}


module.exports.parseImgPath = parseImgPath;
module.exports.linkList = linkList;
module.exports.saveScrapingAltData = saveScrapingAltData;