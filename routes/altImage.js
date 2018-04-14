var cheerio = require('cheerio');
var urlType = require('url');
var request = require('request');
var fs = require('fs');
var dataManager = require('./dataManager');

var httpReg = /^((http(s?))\:\/\/)([0-9a-zA-Z\-]+\.)+[a-zA-Z]{2,6}(\:[0-9]+)?(\/\S*)?$/;
const DEFAULTALT = '글이 포함되지 않은 이미지 입니다.';

//html을 입력으로 받아 imagePath : alt Object return
var parseImgPath = function (url, html) {
    var images = {};
    var src = null;
    var alt = null;
    //imagesList 생성하여 images에 넣어줌
    var $ = cheerio.load(html);

    $('img').each(function (idx, item) {
        src = $(item).attr('src');
        alt = $(item).attr('alt');
//        src = urlType.resolve(url, src);            //절대경로로 변경

        if(httpReg.test(src)){
            images[src] = alt;
        }
    });
    return images;              //{path : alt}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//Object를 입력으로 받아 대체텍스트가 비정상적인 key만 담아 Object return
var altAnalyzer = function (imagePath) {
    for(var i in imagePath){
        if(imagePath[i]!="상품이미지" && imagePath[i] != ""){
            delete imagePath[i];
        }
    }
    return imagePath;           //대체 텍스트 비정상적인 것만 있는 {path:alt}
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////



//////////////////////////////////////////////////////////////////////////////////////////////////////////
var imageDownloader = function (url) {
    var savedir = __dirname + "/img";
    if (!fs.existsSync(savedir)) {
        fs.mkdirSync(savedir);
    }
    var fname = urlType.parse(url).pathname;
    fname = savedir + "/" + fname.replace(/[^a-zA-Z0-9\.]+/g, '_');
    request(url).pipe(fs.createWriteStream(fname));

    return fname;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////




//////////////////////////////////////////////////////////////////////////////////////////////////////////
//Google Vision API 연동
var imgAnalyzer = function (path, localPath) {

    var analyzedAlt = null; //분석 결과 alt

    dataManager.saveImgInfo(path, localPath, analyzedAlt);          //이미지 분석 결과 저장
    return analyzedAlt;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////





//////////////////////////////////////////////////////////////////////////////////////////////////////////
//result에 path와 alt 삽입
var insertResult = function (path, result, alt) {

    result['path'] = alt;

    return result;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////



//////////////////////////////////////////////////////////////////////////////////////////////////////////


//result에 path와 Default alt 삽입
var defaultResultList = function (path, result, alt) {

    result['path'] = DEFAULTALT;

    return result;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports.parseImgPath = parseImgPath;
module.exports.altAnalyzer = altAnalyzer;
module.exports.imageDownloader = imageDownloader;
module.exports.imgAnalyzer = imgAnalyzer;
module.exports.insertResult = insertResult;
module.exports.defaultResultList = defaultResultList;