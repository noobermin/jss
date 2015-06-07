function importinto(ns, targetns) {
    if(!targetns) targetns = window;
    for(name in ns) {
        targetns[name]=ns[name];
    }
}
var $dom={};

var array = (function(){
    function mkarraycall(callname) {
        return Array.prototype[callname].call.bind(Array.prototype[callname]);
    }
    var concat = mkarraycall("concat"),
        slice = mkarraycall("slice");
    return {
        map:mkarraycall("map"),
        filter:mkarraycall("filter"),
        concat:concat,
        reduce:mkarraycall("reduce"),
        slice:slice,
        concatv:function(arraylike,lists) {
            return concat.apply(concat,concat([arraylike],lists));
        },
        //convience functions
        has: function(arraylike,ino){return filter(arraylike,function(c){return c == ino}).length > 0;},
        last:function(arraylike){ return arraylike[arraylike.length-1]; },
        setlast: function(arraylike,d){ arraylike[arraylike.length-1]=d; },
        findfirst: function(arraylike, func) {
            var arr = slice(arraylike);
            if (func.constructor !== Function) {
	            var val=func;
	            func = (function(c){return c==val;});
            }
            for(var i=0; i < arr.length; ++i)
	            if (func(arr[i])) return i;
            return -1;
        },
        arr: function (n,fill) {
            if (fill===undefined) fill=0;
            if (n===undefined) n=0;
            var arr = [];
            for(;n!=0;--n) arr.push(fill);
            return arr;
        },
        rnd: function(n,low,hi) {
            if (low===undefined) low =0;
            if (hi===undefined) hi =1;
            var t = low; low = Math.min(low,hi);
            hi = Math.max(t,hi);
            if (n == 1) return Math.random()*(hi - low) + low;
            return arr(n).map(function(c){
                return Math.random()*(hi - low) + low;
            });
        },
        rndint: function(n, low, hi){
            if (low===undefined) low =0;
            if (hi===undefined) hi =1;
            var t = low; low = Math.min(low,hi);
            hi = Math.max(t,hi);
            if (n == 1) return Math.floor(Math.random()*(hi - low)) + low;
            arr(n).map(function(c){
                return Math.floor(Math.random()*(hi - low)) + low;
            });
        },
        pairs: function(arr){
            return arr.map(function(c,i){
                return arr.slice(i+1).map(function(d){
                    return [c,d];
                });
            }).reduce(function(p,c){
                return p.concat(c);
            });
        },
        arange: function(start,end,step){
            !step && (step = 1);
            if(!end){
                end=start; start=0;
            }
            var n = (end-start)/step;
            if(n<0)return [];
            
            return arr(n).map(function(c,i){
                return i*step + start;
            });       
        }
    };
})();
//my "functional" redefinition of these functions

//aliases
function byid(id){return document.getElementById(id);}
function byclass(clas) { return array.slice(document.getElementsByClassName(clas)); }
function idof(el){return el.id;}

//DOM stuff
var dom = (function(document){
    var arr = array;
    var ret = {};
    function exportf(a){
        [ret].concat(
            arr.slice(arguments,1)
        ).forEach(function(c){
            c[a.name] = a;
        });
    }
    function exportv(v,n){
        [ret].concat(
            arr.slice(arguments,1)
        ).forEach(function(c){
            c[n] = v;
        });
    }
    
    function mk(el,attr,classes,html){
        if (attr) for (prop in attr)
	        el.setAttributeNS(null,prop,attr[prop]);
        if (classes)
	        addclass(el,classes);
        if (html)el.innerHTML = html;
        return el;
    }
    //makers
    var create = {
        mkel: function(type, attr, classes, html) {
            return mk(document.createElement(type),attr,classes,html);
        },
        mksvg: function(type, attr, classes, html) {
            mk(document.createElementNS("http://www.w3.org/2000/svg",type),
               attr,classes,html);
        }
    };
    importinto(create, ret);
    exportv(create,"create");

    
    function other_args(a){
        return Array.isArray(a[1]) ? a[1] : arr.slice(a,1);
    }

    var modify={
        append: function(el) {
            el = $dom.$toel(el);
            other_args(arguments).forEach(function(c){
                el.appendChild(
                    $dom.$toel(c)
                );
            });
            return el;
        },
        rmclass: function(el) {
            el = $dom.$toel(el);
            el.classList.remove.apply(
                el.classList,other_args(arguments)
            );
            console.log(el.classList);
            return el;
        },
        addclass: function(el) {
            el = $dom.$toel(el);
            el.classList.add.apply(
                el.classList,other_args(arguments)
            );
            return el;
        },
        addtempclass:function(el){
            var args = arr.slice(arguments,1,arguments.length-1);
            var time = arguments[arguments.length-1];
            modify.addclass(el, args);
            setTimeout(function(){
	            modify.rmclass(el,args);
            },time);
            return el;
        },
        hasclass: function(el){
            console.log(arguments);
            el = $dom.$toel(el);
            var ret= el.classList.contains.apply(
                el.classList,
                other_args(arguments)
            );
            console.log(ret);
            return ret;
        },
        evlis:function(el,type,f,pass) {
            el = $dom.$toel(el);
            (!pass || pass != false) && (pass = true);
            el.addEventListener(type,f,pass);
            return el;
        },
        evliss: function() {
            for(var i=1; i< arguments.length; i+=2)
	            modify.evlis(arguments[0], arguments[i], arguments[i+1],false);
            return arguments[0];
        },
        insert_after: function(el, before) {
            el = $dom.$toel(el);
            before = $dom.$toel(before);
            before.parentElement.insertBefore(el,before.nextSibling);
        },
        insert_before: function(el, after) {
            el = $dom.$toel(el);
            after = $dom.$toel(after);
            after.parentElement.insertBefore(el,after);
        },
        //pruner
        prune: function(el) {
            while (el.hasChildNodes()) el.removeChild(el.lastChild);
            return el;
        },
        rmel: function(el,tempclass,delay,f) {
            if(!el) return;
            el = $dom.$toel(el);
            if (tempclass && !delay) {
	            delay = tempclass; delete tempclass;
            }
            if (delay) {
	            if (tempclass) modify.addclass(el,tempclass);
	            setTimeout(function() {
	                if (el.parentElement)
		                el.parentElement.removeChild(el);
	                if (f) f();
	            },delay);
            } else {
	            if (el.parentElement) {
	                el.parentElement.removeChild(el);
	            }
            }
        },
        inner: function(el,innert) {
            el = $dom.$toel(el);
            if(!innert) return el.innerHTML;
            else {
	            el.innerHTML = innert;
	            return el;
            }
        },
        attr: function(el) {
            if( arguments.length == 2) return el[arguments[1]];
            else for(var i=1; i < arguments.length; i+=2)
	            el.setAttributeNS(null,[arguments[i]],arguments[i+1]);
            return el
        }
    };
    importinto(modify, ret);
    exportv(modify,"modify");
    return ret;
})(document);

$dom = (function(document){
    var arr = array, D=dom;
    var ret = {};
    function exportf(a){
        [ret].concat(
            arr.slice(arguments,1)
        ).forEach(function(c){
            c[a.name] = a;
        });
    }
    function exportv(v,n){
        [ret].concat(
            arr.slice(arguments,1)
        ).forEach(function(c){
            c[n] = v;
        });
    }

    //
    //my super element wrapper type
    //
    function applier(f,el,args){
        return f.apply(f, [el].concat(arr.slice(args)));
    }
    function _$(el){
        this.el = el;
        this.__iama_$ = true;
    }
    function addDmethod(name){
        _$.prototype[name] = function(){
            var ret = applier(D[name], this.el, arguments);
            return ret.nodeType ? this : ret; //ick
        };
    }
    for(name in D.modify){
        addDmethod(name);
    }
    _$.prototype.id = function() { return idof(this.el); };
    exportf(_$);
    
    //other goodies
    function is$(el) { return el.__iama_$; }; exportf(is$);
    function $toel(el) { return is$(el) ? el.el : el; }; exportf($toel);

    
    function $(el){return !is$(el) ? new _$(el) : el; }
    //creation functions
    var factories = {
        $:$, //MONEY
        $byid: function(id) { return new _$(byid(id));},
        $mkel: function(a,b,c,d){return factories.$(mkel(a,b,c,d));},    
        $mksvg:function(a,b,c,d){return factories.$(mksvg(a,b,c,d));}
    }
    importinto(factories, ret);
    exportv(factories,"factories");
    
    return ret;
})(document);

//xmlhttprequest
function mkxhr(){
    if (window.XMLHttpRequest){ return new XMLHttpRequest();}
    else if (window.ActiveXObject) {
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

//exporting node stuff
if(typeof exports !== 'undefined') {
    exports.array = array;
    exports.importinto = importinto;
}
