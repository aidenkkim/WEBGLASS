/*
* Electron main process
*
* TARGET_URL에 대하여 electron으로 데이터 다운로드, 페이지를 ./test.html이란 이름으로 저장
* */

var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var crawl_list = require('./crawl_list');
var win = new Array();


// 준비가 된 시점에 호출되는 이벤트
app.on('ready', function () {
    crawl_list.linkList(0, function (linkList) {
        var count = 0;

        for (var i in linkList) {
            // 메인 윈도우 생성
            win[count] = new BrowserWindow({
                width: 800,
                height: 600
            });
            // 지정 URL 로드
            win[count].loadURL(linkList[i].path);
            count++;
        }

        var count = 1;
        setTimeout(function () {
            for (var i in win) {
                //javascript 파일까지 로딩 후 크롤링 하기 위해서 일정 시간 Delay

                //로딩된 페이지를 ./test.html로 저장 , 모든 컨텐츠도 다운로드됨
                //HTMLComplete, HTMLOnly 선택 가능
                win[i].webContents.savePage('./crawled_data/gamrketTop10_'+linkList[i].top10_link_id+ '.html', 'HTMLComplete', (error) => {
                    if (!error) {
                        console.log('Save Page Successful' + count + ' / ' + win.length);
                        count++;

                    }
                });
            }

        }, 10000);
    });
});