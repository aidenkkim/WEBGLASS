/*
* 접근성 개선하고자 하는 페이지에 대하여 alt를 분석하여 실제 개선
*
*
*
* */

var cheerio = require('cheerio');
var urlType = require('url');
var request = require('request');
var fs = require('fs');
var dataManager = require('./dataManager');

//이미지 안에 글씨가 포함되지 않는 경우 표시되는 alt 문구 포맷
const DEFAULTALT = '글이 포함되지 않은 이미지 입니다.';

//url 형태인지 판단하는 정규식
var httpReg = /^((http(s?))\:\/\/)([0-9a-zA-Z\-]+\.)+[a-zA-Z]{2,6}(\:[0-9]+)?(\/\S*)?$/;




/*
*  Iframe src 추출
*
*   G마켓의 경우 Iframe안에 상품 상세 정보가 포함되어 있음
* INPUT     :   html code(String)
* OUTPUT    :   iframe link(String)
* */
var iframeExtract = function(html, callback){
    var $ = cheerio.load(html);
    var iframePath = $('#detail1').attr('src');
    callback(iframePath);
}


/*
* 접근성 개선하고자 하는 페이지를 입력받아 img 태그를 추출
*
* INPUT     :   html code (String)
* OUTPUT    :   {image Link Path : alt} (Object)
* */
var parseImgPath = function (url, html, callback) {
    var images = {};
    var src = null;
    var alt = null;
    var $ = cheerio.load(html);

    //Image Object Map 생성
    $('img').each(function (idx, item) {
        src = $(item).attr('src');
        alt = $(item).attr('alt');

//        src = urlType.resolve(url, src);            //절대경로로 변경

        //URL 형태인지 체크
        if(httpReg.test(src)){
            images[src] = alt;
        }
    });
    callback(images);
}


/*
* Abnormal Image Alt Text를 삽입
* 1. OCR 로 Text 추출
* TEXT 존재하는 경우 alt 에 삽입
* Text 존재하지 않는 경우 'DEFAULTALT' 삽입
*
* INPUT     :   {Record Checked Image Link Path : alt} (Object) alt 검색결과존재(TEXT) || 0 (검색 결과에 없음)
* OUTPUT    :   {Web Accessibility Improved Image Link Path : Web Accessibility Improved alt} (Object)
**/
var altImproving = function (GOOGLEVISIONAPI, images, callback) {

    //{Web Accessibility Improved Image Link Path : Web Accessibility Improved alt} (Object)
    var result = {};

    //Asynchronous 하게 처리됨
    //검색 결과에 존재하는 경우 result에 넣어줌
    //검색 결과에 존재하지 않는 경우 Google Vision API 사용하여 OCR 추출
    // i == path
    // images[i] == alt
    for (var i in images) {

        //검색 결과에 존재안함
        if (images[i] == 0) {

            /*
            * Image Link를 주면 다운로드
            *
            * INPUT     :   Image URL
            * OUTPUT    :   Local Path of Downloaded Image
            **/
            imageDownloader(i, function(localPath){

                /*
                * Google Vision API 로 OCR Extract
                *
                * INPUT     :   Google Vision API, Image Link Path, Local Path
                * OUTPUT    :   Analyzed Alt Text
                * 글씨가 있을 경우 alt = Text
                * 글씨가 없을 경우 alt = null
                **/
                OCRExtract(GOOGLEVISIONAPI, i, localPath, function(path, analyzedAlt){            //이미지 분석(vision api)
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



/*
* Image Link를 주면 다운로드
*
* INPUT     :   Image URL
* OUTPUT    :   Local Path of Downloaded Image
**/
var imageDownloader = function (url, callback) {

    //Image 저장 위치 지정
    var savedir = __dirname + "/img";
    
    //Directory 존재하지 않을 경우 생성
    if (!fs.existsSync(savedir)) {
        fs.mkdirSync(savedir);
    }
    
    //절대 경로로 변경
    var fname = urlType.parse(url).pathname;
    fname = savedir + "/" + fname.replace(/[^a-zA-Z0-9\.]+/g, '_');
    
    //Pipeline 이용하여 바로 File System 에 저장
    request(url).pipe(fs.createWriteStream(fname+'.jpg'));

    callback(fname);
}




/*
* Google Vision API 로 OCR Extract
*
* INPUT     :   Google Vision API, Image Link Path, Local Path
* OUTPUT    :   Analyzed Alt Text
* 글씨가 있을 경우 alt = Text
* 글씨가 없을 경우 alt = null
**/
var OCRExtract = function (GOOGLEVISIONAPI, path, localPath, callback) {

    var analyzedAlt = null; //분석 결과 alt

    // Google Vision API Text Detection
    GOOGLEVISIONAPI.textDetection(path).then(results => {

        if(results[0].fullTextAnnotation != null){
            //Detection된 Text가 있는 경우
            analyzedAlt=results[0].fullTextAnnotation.text;
        }else{
            //Detection된 Text가 없는 경우
            analyzedAlt=null;
        }

        /*
        * 검색한 이미지 결과를 저장
        * INPUT     :   Image Link Path, Saved Local Path, Analyzed Alt
        **/
        dataManager.saveRecoredImageInfo(path, localPath, analyzedAlt);

        //Asynchronous 하게 Return
        callback(path, analyzedAlt);
    }).catch(err => {
        console.error(err);
    });



}


module.exports.parseImgPath = parseImgPath;
module.exports.imageDownloader = imageDownloader;
module.exports.OCRExtract = OCRExtract;
module.exports.altImproving = altImproving;
module.exports.iframeExtract = iframeExtract;