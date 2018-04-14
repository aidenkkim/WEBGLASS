var req = new XMLHttpRequest();
req.open('POST', 'http://localhost:3000');
req.setRequestHeader('Content-type', 'application/json');
var data = {html : '<html></html>'};
req.onreadystatechange = function(e){
    console.log(typeof(req.responseText));
    console.log(JSON.parse(req.responseText));
}
req.send(JSON.stringify(data));