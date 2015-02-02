var http = require('http'),
    url = require('url'),
    querystring = require('querystring'),
    htm = require('./htm'),
    fs = require('fs');
		   
function mkrouter(site,notfound,serverr){
    return function(req, res){
	var path = url.parse(req.url).pathname;
	try {
	    if (site[path]) {site[path](req,res);}
	    else {
		var err = new Error("Path not supplied.");
		err.code = 'ENOENT';
		throw err;
	    }
	} catch (err) {
	    console.log(err);
	    if (err.code === 'ENOENT') {
		if (notfound) { notfound(req,res);}
		else {
		    res.writeHead(404,{'Content-Type':  'text/html'});
		    res.end('<html><head></head><body>404--not found.</body></html>');
		}
	    } else {
		if(serverr) serverr(req,res);
		else {
		    res.writeHead(500,{'Content-Type':  'text/html'});
		    res.end('<html><head></head><body>500--server error.</body></html>');
		}
	    }
	}//catch
    };/*return*/
}//function mkrouter


function mkfileread(type,prefix) {
    if (!prefix) prefix='./'
    return function(req,res) {
	var name = prefix+url.parse(req.url).pathname;
	fs.readFile(name,function (err,data){
	    if(err) throw err;
	    res.writeHead(200,{'Content-Type':type});
	    res.end(data);
	});
    }
}

function mkpostreader(handler,passResponse,nonPostErr){
    return function(req,res) {
	if ( req.method == 'POST') {
	    var data ='';
	    req.on('data', function(d){
		data+=d;
		//too much data--killoff
		if (data.length > 1e6) {
		    res.writeHead(413, {'Content-Type': 'text/plain'}).end();
		    console.log("recieved too much POST data");
		    request.connection.destroy();
		}
	    }).on('end',function(){
		if (passResponse)
		  { handler(data,req,res); }
		else {
		    res.writeHead(200,{'Content-Type':'plain/text'});
		    res.end("success");
		    handler(data,req,res);
		}
	    });
	} else {
	    var err;
	    if (nonPostErr) err = new Error(nonPostErr);
	    else err = new Error("Attempted not to post to "+url.parse(req.url).pathname);
	    err.code = 'ENOENT';
	    throw err;
	}
    };
}

};
var users = {
    "yidie"     : ["pancakes",1];
    "noobermin" : ["1234",2];
};

function check_login(username, password) {
    if (users[username]
	&& users[username][0]===password )
	return users[username][1];
}

var site = {
    '/tree.html': mkfileread("text/html"),
    '/tree.js':   mkfileread("text/plain"),
    '/htm.js':    mkfileread("text/plain"),
    '/cookies.js':mkfileread("text/plain"),
    '/tree.css':  mkfileread("text/css"),
    '/login.css':  mkfileread("text/css"),
    '/test.html': mkfileread("text/html"),
    '/login' : mkpostreader(function(data,req,res){
	var d = querystring.parse(data);
	if( check_login(d.username,d.password) ) {
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
	if (!check_login(d.username,d.password){
	    res.writeHead(403, {'Content-Type': 'text/plain'});
	    res.end('bad login');
	    return;
	}
	
    },true),
    '/reader.html': mkfileread("text/html"),
    '/write':  mkpostreader(function(data,req,res){
	console.log("recieved:");
	console.log(data);	
    }),
    '/test' : function(req,res) {
	res.writeHead(200,{'Content-Type':  'text/html'});
	res.end('<html><body></body></html>');
    }
};


http.createServer(mkrouter(site)).listen(8080);    

