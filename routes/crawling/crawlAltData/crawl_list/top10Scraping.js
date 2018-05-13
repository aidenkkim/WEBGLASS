/*
* 다운로드된 Top10 이 포함된 Page 를 Scraping하여 Top 10 Link 추출
*
* */

var iconv = require('iconv-lite');
var fs = require('fs');
var crawl_list = require('./crawl_list');

//첫번째 파라미터 0 == 다운로드, 1 == 스크래핑
crawl_list.linkList(1, function (linkList) {

    //Console 출력용
    var count = 1;

    //모든 Response 완료 후 마지막 확인용
    var extractTop10Count = 0;

    //최종 List 저장 Array
    var resData = new Array();

    for (var i in linkList) {
        //Binary로 읽어야 아래에서 Encoding 변경 가능
        try{
        var data = fs.readFileSync('./crawled_data/gamrketTop10_'+ linkList[i].top10_link_id + '.html', 'binary');

        //Encoding 변경
        var convert_html = iconv.decode(data, 'utf-8');

        //Top10 Link Extract
        crawl_list.extractTop10(convert_html, function(data){
            extractTop10Count++;

            //최초의 배열을 넣어줌으로서 배열 형태 확립
            if(extractTop10Count == 1){
                resData = data;
            }else{
                //배열 concat하여 데이터 추가(두 배열 합침)
                resData = resData.concat(data);
            }
            //최종 Response 도착하면 Scraping 된 Link List 저장
            if(extractTop10Count >= linkList.length){
                crawl_list.saveCrawlList(resData);
                console.log('Save Crawled List Done')
            }
        });
        console.log('Scarping Page : ' + count + ' / ' + linkList.length);
        if(count >= linkList.length){
            console.log('Scrap Page Done');
        }
        count++;
        }catch(err){
            console.log('File Read Err : ' + i + '.html');
        }
    }

});