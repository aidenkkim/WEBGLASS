/*
* Electron Gmarket Top10 상품 페이지 다운로드
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
    //첫번째 파라미터 0 == 다운로드, 1 == 스크래핑
    crawl_list.linkList(0, function (linkList) {
        
        //Console 출력용        
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
            console.log('Loading Page : '+count);
        }

        //Console 출력용
        //최종 완료 파악용
        var count = 1;
        
        //모든 페이지 로딩 후 다운로드가 실행되야 모든 리소스 다운로드
        //5개 페이지는 10초 정도 최적화
        setTimeout(function () {

            //모든 로딩된 페이지에 대해 작업 수행
            for (var i in win) {

                //javascript 파일까지 로딩 후 크롤링 하기 위해서 일정 시간 Delay
                //로딩된 페이지를 ./test.html로 저장 , 모든 컨텐츠도 다운로드됨
                //HTMLComplete, HTMLOnly 선택 가능
                win[i].webContents.savePage('./crawled_data/gamrketTop10_'+linkList[i].top10_link_id+ '.html', 'HTMLComplete', (error) => {
                    if (!error) {
                        console.log('Saving Page : ' + count + ' / ' + win.length);

                        //마지막 Response 에 대해 필터링
                        if(count >= win.length){
                            console.log('Save Top10 Page Done');
                        }
                        count++;
                    }
                });
            }

        }, 10000);
    });
});