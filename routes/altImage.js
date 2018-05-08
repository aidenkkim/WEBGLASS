var cheerio = require('cheerio');
var urlType = require('url');
var request = require('request');
var fs = require('fs');
var dataManager = require('./dataManager');

var httpReg = /^((http(s?))\:\/\/)([0-9a-zA-Z\-]+\.)+[a-zA-Z]{2,6}(\:[0-9]+)?(\/\S*)?$/;
const DEFAULTALT = '글이 포함되지 않은 이미지 입니다.';

//html을 입력으로 받아 imagePath : alt Object return
var parseImgPath = function (url, html, callback) {
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
    callback(images);
    //return images;              //{path : alt}
}


var imageProcessing = function (client, images, callback) {
    var result = {};                  //최종 결과
    for (var i in images) {
        if (images[i] == 0) {               //검색 결과에 존재안함
            imageDownloader(i, function(localPath){      //이미지 다운로드
                imgAnalyzer(client, i, localPath, function(path, analyzedAlt){            //이미지 분석(vision api)
                    if (analyzedAlt != null) {                              //글이 포함된 경우
                        callback(path, analyzedAlt);
                    } else {                                                //글이 포함 안된 경우
                        callback(path, DEFAULTALT);                         //resultList에 '글이 포함되지 않은 이미지 입니다' 삽입
                    }
                });
            });
        }else{                                                  //검색 결과에 존재
            callback(i, images[i]);                               //글 포함되었건, 안되었건 모두 사전 처리 되어있으므로 넣기만 하면됨
        }
    }
}



//////////////////////////////////////////////////////////////////////////////////////////////////////////
var imageDownloader = function (url, callback) {

    var savedir = __dirname + "/img";
    if (!fs.existsSync(savedir)) {
        fs.mkdirSync(savedir);
    }
    var fname = urlType.parse(url).pathname;
    fname = savedir + "/" + fname.replace(/[^a-zA-Z0-9\.]+/g, '_');
    request(url).pipe(fs.createWriteStream(fname+'.jpg'));

    callback(fname);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////




//////////////////////////////////////////////////////////////////////////////////////////////////////////
//Google Vision API 연동
var imgAnalyzer = function (client, path, localPath, callback) {
    var analyzedAlt = null; //분석 결과 alt
// Performs label detection on the image file
    client.textDetection(path).then(results => {
        if(results[0].fullTextAnnotation != null){
            analyzedAlt=results[0].fullTextAnnotation.text;
        }else{
            analyzedAlt=null;
        }
        dataManager.saveImgInfo(path, localPath, analyzedAlt);          //이미지 분석 결과 저장
        callback(path, analyzedAlt);
    }).catch(err => {
        console.error(err);
    });



}

//////////////////////////////////////////////////////////////////////////////////////////////////////////




//////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports.parseImgPath = parseImgPath;
module.exports.imageDownloader = imageDownloader;
module.exports.imgAnalyzer = imgAnalyzer;
module.exports.imageProcessing = imageProcessing;