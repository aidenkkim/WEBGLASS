/*
* Electron main process
*
* TARGET_URL에 대하여 electron으로 데이터 로딩 후 페이지를 ./test.html이란 이름으로 저장
* */

var iconv = require('iconv-lite');
var parseImgPath = require('./altScraping');
var fs = require('fs');
var electron = require('electron');

var app = electron.app;
var BrowserWindow = electron.BrowserWindow;

var TARGET_URL = "http://item.gmarket.co.kr/Item/ItemDetail?goodsCode=1280233513&detailVersionType=2&isNew=false";


// 준비가 된 시점에 호출되는 이벤트
app.on('ready', function () {
    // 메인 윈도우 생성
    win = new BrowserWindow({
        width: 800,
        height: 600
    });
    // 지정 URL 로드
    win.loadURL(TARGET_URL);

    //javascript 파일까지 로딩 후 크롤링 하기 위해서 일정 시간 Delay
    setTimeout(function () {
        //로딩된 페이지를 ./test.html로 저장 , 모든 컨텐츠도 다운로드됨
        //HTMLComplete, HTMLOnly 선택 가능
        win.webContents.savePage('./test.html', 'HTMLComplete', (error) => {
            if (!error) console.log('Save Page Successful')

            //저장된 html 읽어오기
            //Binary로 읽어야 아래에서 Encoding 변경 가능
            var data = fs.readFileSync('./test.html', 'binary');

            //Encoding 변경
            var convert_html = iconv.decode(data, 'utf-8');

            //Image src, alt 추출하는 함수 호출
            parseImgPath.parseImgPath(TARGET_URL, convert_html);

        })
    }, 8000);
});