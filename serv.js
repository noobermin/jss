var http = require('http'),
    url = require('url'),
    querystring = require('querystring'),
    fs = require('fs'),
    htm = require('./jss/htm'),
    nde = require('./jss/nde');

//aliases
var mkfileread   = nde.mkfileread,
    mkpostreader = nde.mkpostreader,
    mkrouter     = nde.mkrouter;

var users = {
    "yidie"     : ["pancakes",1],
    "noobermin" : ["1234",2],
    "test"      : ["test",0]
};

function check_login(username, password) {
    if (users[username]
	&& users[username][0]===password )
	return users[username][1];
}
function userfile(ui){return 'forest/'+ui+'.json';}

var site = {
    '/tree.html': mkfileread("text/html"),
    '/tree.js':   mkfileread("text/plain"),
    '/jss/htm.js':    mkfileread("text/plain"),
    '/tree.css':  mkfileread("text/css"),
    '/shapes.css':  mkfileread("text/css"),
    '/test.html':  mkfileread("text/html"),
    '/login' : mkpostreader(function(data,req,res){
	var d = querystring.parse(data);
	if( check_login(d.username,d.password) ) {
	    //check if file exists.
	    console.log("good");
	    res.writeHead(200, {'Content-Type': 'text/plain'});
	    res.end('good login');
	} else {
	    res.writeHead(403, {'Content-Type': 'text/plain'});
	    res.end('bad login');
	}
	console.log("recieved:");
	console.log(" parsed:",d);
    },true),
    '/get':mkpostreader(function(data,req,res){
	var d = querystring.parse(data);
	var ui = check_login(d.username,d.password);
	if (!ui){
	    res.writeHead(403, {'Content-Type': 'text/plain'});
	    res.end('bad login');
	    return;
	}
	fs.readFile(userfile(ui),function (err,data){
	    if(err) throw err;
	    res.writeHead(200,{'Content-Type':'plain/text'});
	    res.end(data);
	});
    },true),
    '/reader.html': mkfileread("text/html"),
    '/write':  mkpostreader(function(data,req,res){
	var d = querystring.parse(data);
	var ui = check_login(d.username,d.password);
	if (!ui){
	    res.writeHead(403, {'Content-Type': 'text/plain'});
	    res.end('bad login');
	    return;
	}// else if (ui==3) { //test account
	//  res.writeHead(200, {'Content-Type': 'text/plain'});
	//    res.end('good login');
	//    return;
	//}
	data  = decodeURI(d.data);
	console.log("recieved:",data);
	fs.open(userfile(ui),'w',function(err,fd) {
	    if(err) {
		if (err.code ==="ENOENT" && !fs.existsSync("./forest")) {
		    console.log("need to mkdir");
		}
		res.writeHead(301, {'Content-Type': 'text/plain'});
		res.end('Internal Error');
		return false;
	    }
	    fs.write(fd, data,0,'utf-8', function(err){
		if (err) {
		    res.writeHead(301, {'Content-Type': 'text/plain'});
		    res.end('Error writing file.');
		    console.log("Error writing file.");
		} else {
		    res.writeHead(200, {'Content-Type': 'text/plain'});
		    res.end('good login');
		}
	    });
	});
    },true),
    '/test' : function(req,res) {
	res.writeHead(200,{'Content-Type':  'text/html'});
	res.end('<html><body></body></html>');
    }
};


http.createServer(mkrouter(site)).listen(8080);

