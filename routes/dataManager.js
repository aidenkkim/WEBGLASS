/*
* 데이터 베이스에 관여하는 모든 요청 처리
*
*
*
* */

var config = require('../config');
var mysql = require('mysql');


//이미지 안에 글씨가 포함되지 않는 경우 표시되는 alt 문구 포맷
const DEFAULTALT = '글이 포함되지 않은 이미지 입니다.';

//Database 설정
var pool = function () {
    var dbPool = mysql.createPool({
        connectionLimit: 10,
        host: config.db_host,
        user: config.db_user,
        password: config.db_passwd,
        port: config.db_port,
        database: config.database
    });
    console.log('Create Database Pool Successful')
    return dbPool;
}


/*
* 검색 기록(데이터베이스:abnormal_alt)에서 기존에 검색되었던 것인지 판단(속도 개선을 위함)
* 검색된 것이라면 저장된 데이터를 그대로 사용
* 검색된적이 없다면 Google Vision API 로 OCR 분석
*
* INPUT     :   {Abnormal Image Link Path : alt} (Object)
* OUTPUT    :   {Image Link Path : alt} (Object)  alt 검색결과존재(TEXT) || 0 (검색 결과에 없음)
**/
var RecordCheck = function (images, callback) {

    //Connection Pool에서 하나 연결
    pool().getConnection(function (err, conn) {
        if (err) {
            if (conn) {
                conn.release();
            }
            return;
        }
        console.log('Database Thread ID : ' + conn.threadId);

        var data = {};
        // SQL 문을 실행함
        var exec = conn.query('SELECT * FROM image', data, function (err, result) {

            // Connection Pool 반드시 해제해야 함
            conn.release();
            if (err) {
                console.log('RecordCheck Method SQL Error');
                console.dir(err);
                return;
            }

            //접근성 개선이 필요한 image 들에 대해 검색 기록 데이터 베이스에서 확인
            for (var i in images) {

                //every는 forEach와 같은 쓰임인데, return false => break  / return true => 지속
                result.every(function (item, idx) {

                    //검색 기록의 Image Link Path와 i(개선필요한 Image Path) 비교
                    if (item.image_path == i) {
                        //검색기록에 존재할 경우 데이터 사용
                        images[i] = item.image_content;

                        //데이터베이스에서 찾으면 해당 Image 는 바로 Break;
                        return false;
                    } else {
                        //검색기록에 존재하지 않는 경우
                        images[i] = 0;
                        return true;
                    }
                });
            }

            callback(images);
        });
    });

}


/*
* 비정상 대체 텍스트 리스트(데이터베이스:abnormal_alt)를 기반으로 대체 텍스트 정상여부 확인
* INPUT     :   {Image Link Path : alt} (Object)
* OUTPUT    :   {Image Link Path : alt} (Object)
* OUTPUT 에는 대체텍스트가 비정상적인 Image Link 만 존재
**/
var abnormalAltDetect = function (images, callback) {

    //개선해야하는 페이지에 있는 비정상 대체텍스트들 목록
    var abnormalImages = {};

    //Connection Pool에서 하나 연결
    pool().getConnection(function (err, conn) {
        if (err) {
            if (conn) {
                conn.release();
            }
            return;
        }
        console.log('Database Thread ID : ' + conn.threadId);

        var data = {};
        // SQL 문을 실행함
        var exec = conn.query('SELECT * FROM abnormal_alt', data, function (err, result) {

            // Connection Pool 반드시 해제해야 함
            conn.release();
            if (err) {
                console.log('abnormalAltDetect Method SQL Error');
                console.dir(err);
                return;
            }

            //접근성 개선 페이지에서 추출한 모든 img link path에 대해 Abnomal Alt DB에 값이 있는지 확인
            // 비정상 대체 텍스트 리스트에 존재하는지 확인
            for (var i in images) {

                if(images[i] === null || images[i] === undefined || images[i]=== ""){
                    images[i] = 'null';
                }
                //every는 forEach와 같은 쓰임인데, return false => break  / return true => 지속
                result.every(function (item, idx) {
                    
                    //abnormal_alt Table의 abnormal_alt_contents column 내용 가져와 비교
                    //추후 Elastic Search 적용하여 속도 개선 필요
                    if (item.abnormal_alt_contents == images[i]) {
                        abnormalImages[i] = images[i];
                    }
                    return true;
                });
            }
            callback(abnormalImages);
        });
    });
}




/*
* 검색한 이미지 결과를 저장
* INPUT     :   Image Link Path, Saved Local Path, Analyzed Alt
**/
var saveRecoredImageInfo = function (path, localPath, analyzedAlt) {

    //Connection Pool에서 하나 연결
    pool().getConnection(function (err, conn) {
        if (err) {
            if (conn) {
                conn.release();
            }
            return;
        }
        console.log('Database Thread ID : ' + conn.threadId);



        var data = {'image_path' : path,
        'image_local_path':localPath};
        if(analyzedAlt == null){
            //Image 안에 Text 가 없는 경우

            data['image_content'] = DEFAULTALT;
            data['image_alt'] = 0;
        }else{
            //Image 안에 Text 가 있는 경우

            data['image_content'] = analyzedAlt;
            data['image_alt'] = 1;
        }

        // SQL 문을 실행함
        var exec = conn.query('INSERT into image SET ?', data, function (err, result) {
            // Connection Pool 반드시 해제해야 함
            conn.release();
            if (err) {
                console.log('saveRecoredImageInfo SQL Insert Error');
                console.error(err);
                return;
            }
        });
    });

}


module.exports.abnormalAltDetect = abnormalAltDetect;
module.exports.RecordCheck = RecordCheck;
module.exports.saveRecoredImageInfo = saveRecoredImageInfo;