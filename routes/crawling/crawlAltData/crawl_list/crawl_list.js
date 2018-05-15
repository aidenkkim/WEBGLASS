var cheerio = require('cheerio');
var createDB = require('../createDB');

//이미지 안에 글씨가 포함되지 않는 경우 표시되는 alt 문구 포맷
const DEFAULTALT = '글이 포함되지 않은 이미지 입니다.';



/*
* DataBase에 있는 링크 값을 가져오는 함수
*
* INPUT : status(0,1) , callback
* OUTPUT : callback(Link List)
* */
var linkList = function (status, callback) {
    //Connection Pool에서 하나 연결
    createDB.pool().getConnection(function (err, conn) {
        if (err) {
            if (conn) {
                conn.release();
            }
            return;
        }
        //status == 0  : 다운로드안된 상태  /  status == 1 : 다운로드 완료, 분석안된 상태   /  status == 2 : 다운로드 완료, 분석 완료
        var data = {};
        // SQL 문을 실행함
        var query = null;
        if(status == 0){
            query = 'SELECT * FROM top10_link WHERE status='+status +' limit 5';
        }else if(status == 1){
            query = 'SELECT * FROM top10_link WHERE status='+status +'';
        }
        var exec = conn.query(query, data, function (err, result) {
            if (err) {
                console.log('linkList Method SQL Error');
                console.dir(err);
                return;
            }
            console.log('Bring Status '+status+' || Total : '+ result.length) ;
            callback(result);
        });


        //데이터 가져온 후 status Update
        var query2 = null;
        if(status == 0){
            query2 = 'UPDATE top10_link SET status = '+ (status+1) +' WHERE status='+status +' limit 5';
        }else if(status == 1){
            query2 = 'UPDATE top10_link SET status = '+ (status+1) +' WHERE status='+status;
        }
        var exec = conn.query(query2, data, function (err, result) {
            // Connection Pool 반드시 해제해야 함
            console.log('Update Status to '+ (status+1) +' || Total : '+ result.affectedRows);
            conn.release();
            if (err) {
                console.log('linkList update status SQL Error');
                console.dir(err);
                return;
            }
        });
    });
}



/*
* Scraping 된 최종 Link List 저장
* */
var saveCrawlList = function (link) {
    //Connection Pool에서 하나 연결
    createDB.pool().getConnection(function (err, conn) {
        if (err) {
            if (conn) {
                conn.release();
            }
            return;
        }

        // SQL 문을 실행함
        var exec = conn.query('INSERT into crawl_link (company, link, status) VALUES ? ', [link], function (err, result) {
            // Connection Pool 반드시 해제해야 함
            conn.release();
            if (err) {
                console.log('saveCrawlList SQL Insert Error');
                console.error(err);
                return;
            }

            //프로그램 성공적 수행 후 최종 Console Log
            console.log('Save Crawl Link Done');
        });
    });

}

/*
* best-classfieds Class부분에 Top10 Link 들 들어 있음
*
* */
var extractTop10 = function (html, callback) {
    extractClass(html, 'best-classifieds', function (bestClassHTML) {
        var arr = [];
        var $ = cheerio.load(bestClassHTML);
        var count = 0;
        //Image Object Map 생성
        $('a').each(function (idx, item) {
            //마지막 요소는 undefined 되어 있으므로, 10번만 수행 후 종료
            if (count == 10) return false

            //Javascript Option 으로 들어있으므로 추출해야함
            var href = $(item).attr('href');
            var href2 = href.split(",")
            var res = href2[5].split("'");
            
            //중복된 데이터 제거
            //중복된 데이터가 두개 연속으로 되어있는 형태이기 때문에 앞에 삽입된 것과 비교
            //최초는 바로 삽입
            if(count == 0 ){
                arr.push(['G마켓', res[1], 0]);
                count++;
                console.log('Extract Top 10 Class ' + count);
            }else {
                if ((arr[arr.length - 1][1] !== res[1])) {
                    arr.push(['G마켓', res[1], 0]);
                    count++;
                    console.log('Extract Top 10 Class ' + count);
                }
            }

        });
        callback(arr);
    });
}

/*
* className 에 해당되는 DOM 추출
* */
var extractClass = function (html, className, callback) {
    var $ = cheerio.load(html);
    var result = $('.'+className).html();
    callback(result);
}


module.exports.saveCrawlList = saveCrawlList;
module.exports.extractTop10 = extractTop10;
module.exports.linkList = linkList;