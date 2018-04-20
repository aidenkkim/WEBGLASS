var altImage = require('./altImage');
var dataManager = require('./dataManager');

var testHTML = require('./template_code/testHTML');

var vision = require('@google-cloud/vision');

var main = function (req, res) {

    var html = testHTML.html;
    var url = "http://gmarket.co.kr";
    console.log('호출됨');
    /*
        var html = req.body.html;
        var url = req.body.url;
    */
    const client = new vision.ImageAnnotatorClient({
        keyFilename : './routes/visionAPI_KEY.json'
    });


    var result = null;  //최종 리턴 JSON( {imgPath or imgId , alt값)

    //var images = altImage.parseImgPath(url, html); //모든 img 경로 및 alt 저장(path : alt)
    altImage.parseImgPath(url, html, function(images){                      //모든 img 경로 및 alt 저장(path : alt)
        altImage.altAnalyzer(images, function(filteredImages){              //대체 텍스트 정상 여부 확인
            dataManager.searchImage(filteredImages, function(images){           //데이터 베이스에서 검색 {imgPath : alt | 0) alt이면 검색 결과에 존재, 0이면 검색 결과에 없음
                result = altImage.imageProcessing(client, images);
                 console.log(result);
             });
         });
    });



/*

    searchedImages.each(function (idx, item) {
        if (item.value() == 0) {                                                                //검색 결과에 존재안함
            var localPath = altImage.imageDownloader(item.key())                                //이미지 다운로드
            var analyzedAlt = altImage.imgAnalyzer(item.key(), localPath);                     //이미지 분석(vision api)

            if (analyzedAlt != null) {                              //글이 포함안된 경우
                result = altImage.insertResult(item.key(), result, analyzedAlt)            //resultList에 결과값 삽입
            } else {                                                //글이 포함 안된 경우
                result = altImage.defaultResultList(item.key(), result)              //resultList에 '글이 포함되지 않은 이미지 입니다' 삽입
            }
        } else {                                                                                //검색 결과에 존재
            result = altImage.insertResult(item.key(), result, searchedImages.value())            //글 포함되었건, 안되었건 모두 사전 처리 되어있으므로 넣기만 하면됨
        }
    });
*/
    res.send({'result': result})
};

module.exports.main = main;