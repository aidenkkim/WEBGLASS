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

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//Object를 입력으로 받아 대체텍스트가 비정상적인 key만 담아 Object return
var altAnalyzer = function (imagePath, callback) {
    for(var i in imagePath){
        if(imagePath[i]!="상품이미지"){
            delete imagePath[i];
        }
    }
    callback(imagePath);
    //return imagePath;           //대체 텍스트 비정상적인 것만 있는 {path:alt}
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////



var imageProcessing = function (client, images) {
    var result = {};                  //최종 결과
    for (var i in images) {
        if (images[i] == 0) {               //검색 결과에 존재안함
            imageDownloader(i, function(localPath){      //이미지 다운로드
                imgAnalyzer(client, i, localPath, function(analyzedAlt){            //이미지 분석(vision api)
                    if (analyzedAlt != null) {                              //글이 포함안된 경우
                        result[i] = analyzedAlt;
                    } else {                                                //글이 포함 안된 경우
                        result[i] = DEFAULTALT;              //resultList에 '글이 포함되지 않은 이미지 입니다' 삽입
                    }
                });
            });
        }else{                                                  //검색 결과에 존재
            result[i] = images[i];                               //글 포함되었건, 안되었건 모두 사전 처리 되어있으므로 넣기만 하면됨
        }
    }
    return result;
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
    return fname;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////




//////////////////////////////////////////////////////////////////////////////////////////////////////////
//Google Vision API 연동
var imgAnalyzer = function (client, path, localPath, callback) {

// Performs label detection on the image file
    client.textDetection(path).then(results => {
        console.log("path : " +results[0].fullTextAnnotation.text);
    }).catch(err => {
        console.error(err);
    });

    var analyzedAlt = '분석 완료'; //분석 결과 alt

    dataManager.saveImgInfo(path, localPath, analyzedAlt);          //이미지 분석 결과 저장
    callback(analyzedAlt);
    return analyzedAlt;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////




//////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports.parseImgPath = parseImgPath;
module.exports.altAnalyzer = altAnalyzer;
module.exports.imageDownloader = imageDownloader;
module.exports.imgAnalyzer = imgAnalyzer;
module.exports.imageProcessing = imageProcessing;