/*
* Node.js에서 사용자의 요청을 처리(Controller)
* */


var altProcesser = require('./altProcesser');
var dataManager = require('./dataManager');
var testHTML = require('./template_code/testHTML');
var vision = require('@google-cloud/vision');



var main = function (req, res) {
    var html = testHTML.html;
    var url = "http://gmarket.co.kr";
    console.log(url + ' 웹 접근성 개선 요청');

    /*
        var html = req.body.html;
        var url = req.body.url;
    */

    //Google Vision API Key 입력
    const GOOGLEVISIONAPI = new vision.ImageAnnotatorClient({
        keyFilename : './routes/visionAPI_KEY.json'
    });


    //최종 리턴 JSON( {imgPath or imgId , alt값)
    var result = {};


    /*
    * 접근성 개선하고자 하는 페이지 {Image Link Path : alt}
    * INPUT     :   html code (String)
    * OUTPUT    :   {image Link Path : alt} (Object)
    **/
    altProcesser.parseImgPath(url, html, function(images){

        /*
        * 비정상 대체 텍스트 리스트(데이터베이스:abnormal_alt)를 기반으로 대체 텍스트 정상여부 확인
        * INPUT     :   {Image Link Path : alt} (Object)
        * OUTPUT    :   {Abnormal Image Link Path : alt} (Object)
        * OUTPUT 에는 대체텍스트가 비정상적인 Image Link 만 존재
        **/
        dataManager.abnormalAltDetect(images, function(abnormalImages){

            /*
            * 검색 기록(데이터베이스:abnormal_alt)에서 기존에 검색되었던 것인지 판단(속도 개선을 위함)
            * 검색된 것이라면 저장된 데이터를 그대로 사용
            * 검색된적이 없다면 Google Vision API 로 OCR 분석
            *
            * INPUT     :   {Abnormal Image Link Path : alt} (Object)
            * OUTPUT    :   {Image Link Path : alt} (Object)  alt 검색결과존재(TEXT) || 0 (검색 결과에 없음)
            **/
            dataManager.RecordCheck(abnormalImages, function(recordCheckedImages){

                //ImageProcessing 은 Asynchronous 하게 진행되므로 모든 요청에 대한 Response 가 도착한 후 다음 처리 해야함.
                //length 는 Request Image 개수, i는 Response 개수
                var length = Object.keys(recordCheckedImages).length;
                var i = 0 ;

                /*
                * Abnormal Image Alt Text를 삽입
                * 1. OCR 로 Text 추출
                * TEXT 존재하는 경우 alt 에 삽입
                * Text 존재하지 않는 경우 'DEFAULTALT' 삽입
                *
                * INPUT     :   {Record Checked Image Link Path : alt} (Object) alt 검색결과존재(TEXT) || 0 (검색 결과에 없음)
                * OUTPUT    :   {Web Accessibility Improved Image Link Path : Web Accessibility Improved alt} (Object)
                **/
                altProcesser.altImproving(GOOGLEVISIONAPI, recordCheckedImages, function(path, analyzedAlt){

                    //Response 할 때마다 ++
                    i++;

                    //최종 결과데이터 저장
                    result[path]=analyzedAlt;
                    if(i >=length){
                        console.log('*****************최종 결과*****************\n'+result);
                    }


                    /*
                    *
                    * result 는 최종
                    * */
                    res.send({'result': result})
                });
             });
         });
    });

};

module.exports.main = main;