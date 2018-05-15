
var url = 'http://item.gmarket.co.kr/detailview/Item.asp?goodscode=336669015';
var url2 = 'http://item.gmarket.co.kr/detailview/Item.asp?goodscode=739420945';
var url3 = 'http://item.gmarket.co.kr/detailview/Item.asp?goodscode=1155478067';
var url4 = 'http://item.gmarket.co.kr/detailview/Item.asp?goodscode=810518655';


var fs = require('fs');
var page = require('webpage').create();
page.open(url, function () {
    console.log('a');
    try {
        fs.write('./phantom.html', page.content, 'w');
    } catch (e) {
        console.log(e);
    }
    page.open(url2, function () {
        console.log('b');
        try {
            fs.write('./phantom2.html', page.content, 'w');
        } catch (e) {
            console.log(e);
        }

        phantom.exit();
    });
});

