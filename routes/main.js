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
    const client = new vision.ImageAnnotatorClient({                //Google Vision API
        keyFilename : './routes/visionAPI_KEY.json'
    });


    var result = {};  //최종 리턴 JSON( {imgPath or imgId , alt값)

    //var images = altImage.parseImgPath(url, html); //모든 img 경로 및 alt 저장(path : alt)
    altImage.parseImgPath(url, html, function(images){                      //모든 img 경로 및 alt 저장(path : alt)
        dataManager.altAnalyzer(images, function(filteredImages){              //대체 텍스트 정상 여부 확인
            dataManager.searchImage(filteredImages, function(images){           //데이터 베이스에서 검색 {imgPath : alt | 0) alt이면 검색 결과에 존재, 0이면 검색 결과에 없음
                var length = Object.keys(images).length;
                var i = 0 ;
                altImage.imageProcessing(client, images, function(path, analyzedAlt){
                    i++;
                    result[path]=analyzedAlt;
                    if(i >=length){
                        console.log(result);
                    }
                });
             });
         });
    });
    res.send({'result': result})
};

module.exports.main = main;