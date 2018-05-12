/*
* Electron main process
*
* TARGET_URL에 대하여 electron으로 데이터 다운로드, 페이지를 ./test.html이란 이름으로 저장
* */

var iconv = require('iconv-lite');
var altScraping = require('./altScraping');
var fs = require('fs');


altScraping.linkList(1, function (linkList) {
    var count = 1;


    var parseImgPathCount = 0;
    var resData = new Array();
    for (var i in linkList) {
        //저장된 html 읽어오기
        //Binary로 읽어야 아래에서 Encoding 변경 가능
        try {
        var data = fs.readFileSync('./crawled_data/gmarket_' + linkList[i].crawl_link_id + '.html', 'binary');
        }catch (err) {
           console.log('File Read Err : ' + i + '.html');
        }
        //Encoding 변경
        var convert_html = iconv.decode(data, 'utf-8');

        //Image src, alt 추출하는 함수 호출

        altScraping.parseImgPath(convert_html, function(data){
            parseImgPathCount++;
            if(parseImgPathCount == 1){
                resData = data;
            }else{
                resData = resData.concat(data);
            }
            if(parseImgPathCount >= linkList.length){
                altScraping.saveScrapingAltData(resData);
            }
        });
        console.log('Save Page Successful' + count + ' / ' + linkList.length);

        count++;
    }
});
