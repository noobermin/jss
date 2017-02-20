var array = array || null;
var obj = obj || null;
var importinto = importinto || null;
if (typeof require !== 'undefined'){
    var fn = require('./fn');
    array      = fn.array;
    obj        = fn.obj;
    importinto = fn.importinto;
}
if (!array || !obj)
    throw "Please load array and object before loading this!";

//I'm going to recreate cookie shit
var cookier = {
    getr:function(name){
        var r = new RegExp(
            "(?:^|.*;\\s*)"+name+"\\s*\\=\\s*([^;]*).*$");
        return document.cookie.replace(r, "$1");},
    get:function(){
        var args=array.slice(arguments);
        if (args.length === 1)
            return decodeURIComponent(
                cookier.getr(args[0]));
        var o = {};
        args.map(function(c){
            obj.add(o, c,
                    decodeURIComponent(
                        cookier.getr(c)));
            });
        return o;
    },
    setr:function(name,value){
        document.cookie = name+"="+encodeURIComponent(value);
    },
    set:function(){
        array.apairs(arguments).forEach(function(c){
            cookier.setr.apply(null,c);
        });
    },
};
var helpers = {
    other_args:function(a) {
        return Array.isArray(a[1]) ? a[1] : array.slice(a,1);
    }
};

//hack that is better than date objects for me.
var timems = (function(){
    var lib={};
    function mktime(ms){
        var d = new Date(ms);
        var e = new Date(0);
        function getparam(pname){
            var methname='getUTC'+pname;
            return d[methname]()-e[methname]();
        }
        var ret = {};
        [
            ['yr','FullYear'],
            ['mon','Month'],
            ['day','Day'],
            ['hr','Hours'],
            ['min','Minutes'],
            ['sec','Seconds'],
            ['ms','Milliseconds']
        ].forEach(function(c){
            ret[c[0]] = getparam(c[1]);
            ret[c[1]] = getparam(c[1]);
        });
        return ret;
    }
    lib.mktime=mktime;
    return lib;
})();

//aliases
function byid(id){return document.getElementById(id);}
function byclass(el,clas) {
    if (!clas) {
        clas = el; el=document;
    }
    if (typeof el==="string") { el = byid(el); }
    var ret = array.slice(el.getElementsByClassName(clas));
    return ret.length === 1 ? ret[0] : ret;
}
function byq(q){return document.querySelector(q);}
function byqs(q){return document.querySelectorAll(q);}
function idof(el){return $Dom.$Dtoel(el).id;}
function lefttop(x){
    x = $Dom.$Dtoel(x).getBoundingClientRect();
    return [x.left,x.top];
}
function setstyle(title){
    var stylesheets = array.filter(
        document.styleSheets,
        function(c){return c.title.length > 0});
    if (stylesheets.reduce(
        function(p,c){return p || (c.title === title)})
    ){
        stylesheets.forEach( function(c){ 
            (c.disabled = c.title !== title)
        });
        return true;
    } else return false;
}
//herpaderp, trivial callback
function return_false(){return false;}

//DOM stuff
var dom = (function(){
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
    
    var other_args = helpers.other_args;
    var modify={
        append: function(el) {
            el = $Dom.$Dtoel(el);
            other_args(arguments).forEach(function(c){
                el.appendChild(
                    $Dom.$Dtoel(c)
                );
            });
            return el;
        },
        rmclass: function(el) {
            el = $Dom.$Dtoel(el);
            el.classList.remove.apply(
                el.classList,other_args(arguments)
            );
            return el;
        },
        addclass: function(el) {
            el = $Dom.$Dtoel(el);
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
            el = $Dom.$Dtoel(el);
            var ret= el.classList.contains.apply(
                el.classList,
                other_args(arguments)
            );
            return ret;
        },
        evlis:function(el,type,f,pass) {
            el = $Dom.$Dtoel(el);
            (!pass || pass != false) && (pass = true);
            el.addEventListener(type,f,pass);
            return el;
        },
        evliss: function() {
            for(var i=1; i< arguments.length; i+=2)
	            modify.evlis(arguments[0], arguments[i],
                             arguments[i+1],false);
            return arguments[0];
        },
        insert_after: function(el, before) {
            el = $Dom.$Dtoel(el);
            before = $Dom.$Dtoel(before);
            before.parentElement.insertBefore(el,before.nextSibling);
            return el;
        },
        insert_before: function(el, after) {
            el = $Dom.$Dtoel(el);
            after = $Dom.$Dtoel(after);
            after.parentElement.insertBefore(el,after);
            return el;
        },
        append_to: function(el, newparent){
            el = $Dom.$Dtoel(el);
            modify.append(newparent,el);
            return el;
        },
        prune: function(el) {
            while (el.hasChildNodes()) el.removeChild(el.lastChild);
            return el;
        },
        rmel: function(el,tempclass,delay,f) {
            if(!el) return;
            el = $Dom.$Dtoel(el);
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
        rmevlis: function(el, type, f, c){
            el = $Dom.$Dtoel(el);
            (typeof c==="undefined") && (c=true);
            el.removeEventListener(type,f,c);
            return el;
        },
        inner: function(el,innert) {
            el = $Dom.$Dtoel(el);
            if(!innert) return el.innerHTML;
            else {
	            el.innerHTML = innert;
	            return el;
            }
        },
        select_contents: function(el) {
            el = $Dom.$Dtoel(el);
            var r = document.createRange();
            r.selectNodeContents(el);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(r);
        },
        attr: function(el) {
            el = $Dom.$Dtoel(el);
            if( arguments.length == 2) return el[arguments[1]];
            else for(var i=1; i < arguments.length; i+=2) {
	            el[arguments[i]]=arguments[i+1];
            }
            return el;
        },
        attrNS: function(el) {
            el = $Dom.$Dtoel(el);
            if( arguments.length == 2) return el[arguments[1]];
            else for(var i=1; i < arguments.length; i+=2) {
	            el.setAttributeNS(null,arguments[i],arguments[i+1]);
            }
            return el;
        }
    };
    importinto(modify, ret);
    exportv(modify,"modify");
    return ret;
})();

var $Dom = (function(){
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
    function _$D(el){
        this.el = el;
        this.__iama_$D = true;
    }
    function addDmethod(name){
        _$D.prototype[name] = function(){
            var ret = applier(D[name], this.el, arguments);
            return ret && ret.nodeType ? this : ret; //ick
        };
    }
    for(name in D.modify){
        addDmethod(name);
    }
    _$D.prototype.id = function() { return idof(this.el); };
    exportf(_$D);
    
    //other goodies
    function is$D(el){
        return el && el.__iama_$D; }; exportf(is$D);
    function $Dtoel(el) {
        return is$D(el) ? el.el : el; }; exportf($Dtoel);
    
    function $D(el){return !is$D(el) ? new _$D(el) : el; }
    //creation functions
    var factories = {
        $D:$D, //MONEY
        $byid: function(id) { return new _$D(byid(id));},
        $mkel: function(a,b,c,d){return factories.$D(mkel(a,b,c,d));},    
        $mksvg:function(a,b,c,d){return factories.$D(mksvg(a,b,c,d));},
        $byclass: function(a,b){
            var ret = byclass(a,b);
            return ret.length && ret.length>1 ?
                   ret.map(function(c){return $D(c);}) :
                   $D(ret);
        },
        $byq: function(q){ return new _$D(byq(q));},
        $byqs: function(q){ return array.map(
            byqs(q),  function(c){return new _$D(c);});
        }
    }
    importinto(factories, ret);
    exportv(factories,"factories");
    
    return ret;
})();

//exporting node stuff
if(typeof exports !== 'undefined') {
    exports.importinto = importinto;
}
