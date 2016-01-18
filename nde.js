var http = require('http'),
    url = require('url'),
    querystring = require('querystring'),
    fs = require('fs'),
    htm = require('./htm'),
    arr = htm.array;

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

function mkrouter(site,spec){
    var notfoundf = notfound,
        errh      = true;
    if (spec) {
        if (spec.notfound)
            notfoundf=notfound;
        errh=spec.errhandle;
    }    
    return function(req, res){
	    var path = url.parse(req.url).pathname;
        if (errh===true) {
            errh = function(err) {
                if(!err) return endres(res);
                //error handling
                if (!err.nolog) {
                    console.log("error:",
                                err.name ? err.name : err);
                    err.message && console.log(
                        err.message);
                    if (err.stack) {
                        console.log(err.stack)
                    } else {
                        console.log("no supplied stack.");
                    }
                }
                if (err.resf) err.resf(res);
                else interror(res);
                if (err.destroy) {
                    req.connection.destroy();
                }
            };
        }
	    if (site[path]) {site[path](req,res,errh);}
	    else {
            notfoundf(res,path,req);
        }
    };
}

function mkfileread(type, prefix, prehandle) {
    if (!prefix) prefix='./';
    return function(req, res, errh) { fs.readFile(
        //filename
        prefix+url.parse(req.url).pathname,
        function (err,data){
	        if(err) {
                if (prehandle) prehandle(err, req, res);
                errh(res);
            } else {
                endres(res,data,200,type);
            }
        }
    )};
}

function handlenonpost(req,res){
	console.log("Attempted not to post to "+url.parse(req.url).pathname);
}
function TooMuchPostError(req){
    Error.call(this, "Too Much Post From This Bozzo");
    this.name = "TooMuchPostError";
    this.destroy = true;
}

function mkpostreader(handler,opts){
    var passResponse = opts&&opts.passResponse?opts.passResponse:true,
        nonpostf   = opts&&opts.nonpostf?opts.nonpostf:handlenonpost,
        contenttype  = opts&&opts.contenttype?opts.contenttype:"text/plain";
    return function(req, res, errh) {
	    if ( req.method == 'POST') {
	        var data ='';
	        req.on('data', function(d){
		        data+=d;
		        //too much data--killoff
		        if (data.length > 1e6) {
                    return errh(new TooMuchPostError(req));
		        }
	        }).on('end',function(){
		        if (passResponse) {
		            handler(data,req,res,errh);
		        } else {
		            res.writeHead(200,{'Content-Type':contenttype});
		            res.end("success");
		            handler(data,req,res,errh);
                }
	        });
	    } else {
            nonpostf(req,res);
        }
    };}

function creturn(f){
    f && f.apply && f.apply(null, [null].concat(arguments));
}
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
