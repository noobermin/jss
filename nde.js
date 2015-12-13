var http = require('http'),
    url = require('url'),
    querystring = require('querystring'),
    fs = require('fs');

function endres(res, resp, status, type) {
    (!type)  && (type = "text/plain");
    (!status)&& (status = 200);
    res.writeHead(status, {"Content-Type":type});
    res.end(resp);
}
//default handlers
function interror(r){endres(r,"500--internal error", 500);}
function badreq(r)  {endres(r,"400--bad request",    400);}
function notfound(r){endres(r,"404--not found",      404);}

function mkrouter(site,inotfound){
    return function(req, res){
	    var path = url.parse(req.url).pathname;
	    if (site[path]) {site[path](req,res);}
	    else {
            if (inotfound)
                inotfound(path,req,res);
            else
                notfound(res);
        }
    };
}

function mkfileread(type,prefix,errhandle) {
    if (!prefix) prefix='./';
    errhandle = errhandle ? errhandle : interror;
    return function(req,res) {
	    fs.readFile(
            //filename
            prefix+url.parse(req.url).pathname,
            function (err,data){
	            if(err) errhandle(res);
                else    endres(res,data,200,type);
            });
    };
}
function handlenonpost(req,res){
	console.log("Attempted not to post to "+url.parse(req.url).pathname);
}
function mkpostreader(handler,opts){
    var passResponse = opts&&opts.passResponse?opts.passResponse:true,
        nonpostf   = opts&&opts.nonpostf?opts.nonpostf:handlenonpost,
        contenttype  = opts&&opts.contenttype?opts.contenttype:"text/plain";
    return function(req,res) {
	    if ( req.method == 'POST') {
	        var data ='';
	        req.on('data', function(d){
		        data+=d;
		        //too much data--killoff
		        if (data.length > 1e6) {
		            res.writeHead(413, {'Content-Type': contenttype}).end();
		            console.log("recieved too much POST data");
		            req.connection.destroy();
		        }
	        }).on('end',function(){
		        if (passResponse) {
		            handler(data,req,res);
		        } else {
		            res.writeHead(200,{'Content-Type':contenttype});
		            res.end("success");
		            handler(data,req,res);
                }
	        });
	    } else {
            nonpostf(req,res);
        }
    };}

function wrap(a){return encodeURI(JSON.stringify(a));}
function unwrap(a){return JSON.parse(decodeURI(a));}
//require request

exports.wrap = wrap;
exports.unwrap = unwrap;
exports.endres = endres;
exports.mkfileread = mkfileread;
exports.mkpostreader = mkpostreader;
exports.mkrouter = mkrouter;
exports.interror = interror;
exports.badreq = badreq;
exports.notfound = notfound;
