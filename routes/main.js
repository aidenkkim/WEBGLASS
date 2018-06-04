/*
* Node.js에서 사용자의 요청을 처리(Controller)
* */


var request = require('request');


var altProcesser = require('./altProcesser');
var dataManager = require('./dataManager');
//var testHTML2 = require('./template_code/testHTML2');
var vision = require('@google-cloud/vision');


var main = function (req, response) {
    /*var html = testHTML2.html;
    var url = "http://item.gmarket.co.kr/detailview/Item.asp?goodscode=125075689&pos_shop_cd=GE&pos_class_cd=100000020&pos_class_kind=L";
    console.log(url + ' 웹 접근성 개선 요청');
*/

    var html = req.body.html;

    //Google Vision API Key 입력
    const GOOGLEVISIONAPI = new vision.ImageAnnotatorClient({
        keyFilename: './routes/visionAPI_KEY.json'
    });


    //최종 리턴 JSON( {imgPath or imgId , alt값)
    var result = {};


    /*
    *  Iframe src 추출
    *
    *   G마켓의 경우 Iframe안에 상품 상세 정보가 포함되어 있음
    * INPUT     :   html code(String)
    * OUTPUT    :   iframe link(String)
    * */
    altProcesser.iframeExtract(html, function (iframePath) {
        //G마켓 구조상 Iframe 안의 html Link가 진짜 상품 상세
        //iframePath에 있는 상품 이미지 추출
        console.log('iframe 추출 완료');
        request(iframePath, function (err, res, body) {

            /*
            * 접근성 개선하고자 하는 페이지 {Image Link Path : alt}
            * INPUT     :   html code (String)
            * OUTPUT    :   {image Link Path : alt} (Object)
            **/
            altProcesser.parseImgPath(iframePath, body, function (images) {
                console.log('image Path 추출 완료')
                /*
                * 비정상 대체 텍스트 리스트(데이터베이스:abnormal_alt)를 기반으로 대체 텍스트 정상여부 확인
                * INPUT     :   {Image Link Path : alt} (Object)
                * OUTPUT    :   {Abnormal Image Link Path : alt} (Object)
                * OUTPUT 에는 대체텍스트가 비정상적인 Image Link 만 존재
                **/
                dataManager.abnormalAltDetect(images, function (abnormalImages) {
                    console.log('비정상 대체 텍스트 확인 완료');
                    /*
                    * 검색 기록(데이터베이스:abnormal_alt)에서 기존에 검색되었던 것인지 판단(속도 개선을 위함)
                    * 검색된 것이라면 저장된 데이터를 그대로 사용
                    * 검색된적이 없다면 Google Vision API 로 OCR 분석
                    *
                    * INPUT     :   {Abnormal Image Link Path : alt} (Object)
                    * OUTPUT    :   {Image Link Path : alt} (Object)  alt 검색결과존재(TEXT) || 0 (검색 결과에 없음)
                    **/
                    dataManager.RecordCheck(abnormalImages, function (recordCheckedImages) {
                        console.log('기록 검색 완료');
                        //ImageProcessing 은 Asynchronous 하게 진행되므로 모든 요청에 대한 Response 가 도착한 후 다음 처리 해야함.
                        //length 는 Request Image 개수, i는 Response 개수
                        var length = Object.keys(recordCheckedImages).length;
                        var i = 0;

                        /*
                        * Abnormal Image Alt Text를 삽입
                        * 1. OCR 로 Text 추출
                        * TEXT 존재하는 경우 alt 에 삽입
                        * Text 존재하지 않는 경우 'DEFAULTALT' 삽입
                        *
                        * INPUT     :   {Record Checked Image Link Path : alt} (Object) alt 검색결과존재(TEXT) || 0 (검색 결과에 없음)
                        * OUTPUT    :   {Web Accessibility Improved Image Link Path : Web Accessibility Improved alt} (Object)
                        **/
                        altProcesser.altImproving(GOOGLEVISIONAPI, recordCheckedImages, function (path, analyzedAlt) {
                            console.log('OCR 추출 완료');
                            //Response 할 때마다 ++
                            i++;

                            //최종 결과데이터 저장
                            result[path] = analyzedAlt;
                            if (i >= length) {
                                console.log('*****************최종 결과*****************\n' + result);
                                response.send({'result': result})
                            }


                            /*
                            *
                            * result 는 최종
                            * */
                        });
                    });
                });
            });

        });
    })
};


module.exports.main = main;