var XMLHttpRequest = (function(){
    //node?
    if(typeof require !== 'undefined') {
        return require('xmlhttprequest').XMLHttpRequest;
    } else if (XMLHttpRequest) {
        return XMLHttpRequest;
    }
})();
if (typeof require !== 'undefined'){
    obj = require('./htm').obj;
}

function mkxhr(){
    if (XMLHttpRequest){ return new XMLHttpRequest();}
    else if (ActiveXObject) {
	    var ret=null;
	    try { ret = new ActiveXObject("Msxml2.XMLHTTP");}
	    catch (e) {
	        try { ret = new ActiveXObject("Microsoft.XMLHTTP");}
	        catch(e){}
	    }
	    return ret;
    }
    return null;
}
//my fetch-like.
function request(to,message,opts){
    var gopt= function(l,e){return obj.choice(opts,l,e);};
    var xhr = mkxhr();
    var method = gopt('method','GET');
    xhr.open(method,to);
    var mimetype = gopt('mimetype','application/x-www-from-urlencoded');
    xhr.setRequestHeader('Content-type', mimetype);
    if(opts && opts.overrideMimeType){
        xhr.overrideMimeType(opts.overrideMimeType);
    }
    try{ xhr.send(message); } catch (e){console.log("error caught in send: ",e)}
    xhr._callbacks = [];
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4) {
            xhr._callbacks.forEach(function(f){
                f(xhr.responseText, xhr.responseType, xhr.status);
            });
        }
    };
    xhr.then = function(f) {
        xhr._callbacks.push(f);
        return xhr;
    };
    xhr.on = function(status, f){
        xhr._callbacks.push(function(a,b,c){
            if(xhr.status === status)f(a,b,c);
        });
        return xhr;
    };
    return xhr;
}
function jsonreq(to,message,opts){
    opts = obj.cat(
        opts,{method:"POST",
              mimetype:"application/json"});
    return request(to,message,opts)
}
if (typeof exports !== 'undefined'){
    exports.request = request;
    exports.jsonreq = jsonreq;
}
