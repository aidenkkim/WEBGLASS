var request = require('request');


var URL = 'http://item.gmarket.co.kr/detailview/Item.asp?goodscode='
var goodscode = 189847992;

var reqURL = null;





var req = function(count){
    console.log('count : '+count)
    reqURL = URL + goodscode;
    request(reqURL, function (err, res, body) {
        console.log('request : ' + goodscode)
        if (err) {
            console.log('err');
        } else {
            if (body == "<script type='text/javascript'>document.domain='gmarket.co.kr'; alert('상품정보를 가져올 수 없습니다.'); document.location.replace('http://www.gmarket.co.kr');</script>") {
                console.log('상품 정보 없음');
            } else {
                console.log('Crawl : '+goodscode);
            }

            goodscode++;
            count--;

            if(count>0){
                req(count);
            }
        }
    })

}

req(50);