/*
* Electron
* 상품 상세 페이지 다운로드
*
* TARGET_URL에 대하여 electron으로 데이터 다운로드, 페이지를 ./test.html이란 이름으로 저장
* */

var altScraping = require('./altScraping');
var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;

const WINDOW_NUM = 5;

// 준비가 된 시점에 호출되는 이벤트
app.on('ready', function () {
    var win = [];
    for (var i = 0; i < WINDOW_NUM; i++) {
        win[i] = new BrowserWindow({
            show:false
        });
    }
    altScraping.linkList(0, function (linkList) {
        download(0, linkList, win);
    });
});

var download = function (count, linkList, win) {
    var totalLength = linkList.length;
    if (count == totalLength) {
        console.log('Download Done');
        return;
    }

    var currentCountStart = count;
    console.log('------------Current Count : ' + count + ' / ' + totalLength + '--------------');

    for (var i in win) {
        win[i].loadURL(linkList[count].link);
        console.log('Loading Page : ' + count + ' / Window(' + i + ')');
        count++;
    }

    var countStart = currentCountStart;
    setTimeout(function () {
        for (var i in win) {
            win[i].webContents.savePage('./crawled_data/gmarket_' + linkList[(Number(i)+countStart)].crawl_link_id + '.html', 'HTMLOnly', (error) => {
                if (!error) {
                    console.log('Saving Page : ' + currentCountStart + ' / ' + totalLength + '-----------');
                    currentCountStart++;
                    if (currentCountStart % win.length == 0) {
                        console.log('Save Product Page Done');
                        download(count, linkList, win);
                    }
                }
            });
        }
    }, 7000);
}

