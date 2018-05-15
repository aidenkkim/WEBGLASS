var request = require('request');

var URL = 'http://item.gmarket.co.kr/detailview/Item.asp?goodscode='
var goodscode = 100000000;

var reqURL = null;
var createDB = require('../createDB');

var result = [];

var req = function (count) {
    console.log('count : ' + count)
    reqURL = URL + goodscode;
    request(reqURL, function (err, res, body) {
        console.log('request : ' + goodscode)
        if (err) {
            console.log('err');
        } else {
            if (body == "<script type='text/javascript'>document.domain='gmarket.co.kr'; alert('상품정보를 가져올 수 없습니다.'); document.location.replace('http://www.gmarket.co.kr');</script>") {
                console.log('상품 정보 없음');
            } else {
                result.push(['G마켓', reqURL, 0]);
                console.log('Crawl : ' + goodscode);
            }

            goodscode++;
            count--;

            if (count > 0) {
                setTimeout(() => {
                    if (count % 5 == 0) {
                        if (result.length > 0)
                            insertDB(result, goodscode);
                        result = [];
                    }
                    req(count);
                }, 500);
            } else {
                if (result.length > 0)
                    insertDB(result, goodscode);
            }
        }
    })

}


var insertDB = function (data, goodscode) {
//Connection Pool에서 하나 연결
    createDB.pool().getConnection(function (err, conn) {
        if (err) {
            if (conn) {
                conn.release();
            }
            return;
        }
        var query = 'INSERT INTO crawl_link (company, link, status) VALUES ?';
        var exec = conn.query(query, [data], function (err, result) {
            // Connection Pool 반드시 해제해야 함
            conn.release();
            if (err) {
                console.log('insertDB Method SQL Error');
                console.dir(err);
                return;
            }
            console.log('InsertDB Done');
            console.log('GoodsCode : ' + goodscode);
        });
    });
}


req(10000);