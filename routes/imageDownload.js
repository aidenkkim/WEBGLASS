var cheerio = require('cheerio');
var request = require('request');
var urlType = require('url');
var fs = require('fs');

var url = 'https://ko.wikipedia.org/wiki/'+encodeURIComponent("강아지");

var savedir = __dirname + "/img";
if(!fs.existsSync(savedir)){
    fs.mkdirSync(savedir);
}
request(url, function(err, res, body){
    var $ = cheerio.load(body);

    $('img').each(function(idx, item){
        var src = $(item).attr('src');
        src = urlType.resolve(url, src);

        var fname = urlType.parse(src).pathname;
        fname = savedir + "/" + fname.replace(/[^a-zA-Z0-9\.]+/g, '_');
        request(src).pipe(fs.createWriteStream(fname));
    });
});
