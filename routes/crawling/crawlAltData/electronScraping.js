/*
* Link List 안에 삽입된 Img Link Scraping 하여 Alt 목록 추출
*
* */
var cheerio = require('cheerio');
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
        var data = fs.readFileSync('C:/Users/ouhhh/Desktop/Data/gmarket_' + linkList[i].crawl_link_id + '.html', 'binary');

        //Page가 utf-8 , euc-kr 두 가지 형태로 있기 때문에 각각에 대하여 처리
        var $ = cheerio.load(data);

        //Default 는 utf-8
        var charset = "utf-8";

        //Gmart Page에 국한되는 요소
        if($('meta')[0].attribs.charset === undefined){
            charset = $('meta')[0].attribs.content.split("=")[1];
        }else{
            charset = $('meta')[0].attribs.charset;
        }
        //Encoding 변경
        var convert_html = iconv.decode(data, charset);

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
        console.log('Saving Alt Extract : ' + count + ' / ' + linkList.length);
        if(count >= linkList.length){
            console.log('Save Alt Extract Done');
        }
        count++;
        }catch (err) {
            console.log('File Read Err : ' + i + '.html');
        }
    }
});
