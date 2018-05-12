/*
* Electron main process
*
* TARGET_URL에 대하여 electron으로 데이터 다운로드, 페이지를 ./test.html이란 이름으로 저장
* */

var iconv = require('iconv-lite');
var fs = require('fs');

var crawl_list = require('./crawl_list');



crawl_list.linkList(1, function (linkList) {
    var count = 1;

    var extractTop10Count = 0;
    var resData = new Array();

    for (var i in linkList) {
        //Binary로 읽어야 아래에서 Encoding 변경 가능
        var data = fs.readFileSync('./crawled_data/gamrketTop10_'+ linkList[i].top10_link_id + '.html', 'binary');

        //Encoding 변경
        var convert_html = iconv.decode(data, 'utf-8');

        crawl_list.extractTop10(convert_html, function(data){
            extractTop10Count++;
            if(extractTop10Count == 1){
                resData = data;
            }else{
                resData = resData.concat(data);
            }
            if(extractTop10Count >= linkList.length){
                crawl_list.saveCrawlList(resData);
            }
        });
        console.log('Scarp Page Successful' + count + ' / ' + linkList.length);
        count++;
    }

});