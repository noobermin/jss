//my syntatic sugar (slow?)
function mkarraycall(callname) {
    return Array.prototype[callname].call.bind(Array.prototype[callname]);
}

//my "functional" redefinition of these functions
map = mkarraycall("map");
filter = mkarraycall("filter");
concat = mkarraycall("concat");
reduce = mkarraycall("reduce");
slice = mkarraycall("slice");

//convience functions
function has(arraylike,ino){return filter(arraylike,function(c){return c == ino}).length > 0;}
function last(arraylike){ return arraylike[arraylike.length-1]; }
function setlast(arraylike,d){ arraylike[arraylike.length-1]=d; }
function findfirst(arraylike, func) {
    var arr = slice(arraylike);
    if (func.constructor !== Function) {
	var val=func;
	func = (function(c){return c==val;});
    }
    for(var i=0; i < arr.length; ++i)
	if (func(arr[i])) return i;
    return -1;
}
function concatv(arraylike,lists) {
    return concat.apply(concat,concat([arraylike],lists));
}

//aliases
function byid(id){return document.getElementById(id);}
function idof(el){return el.id;}

//DOM stuff
function mkel(type, attr, classes, val) {
    var ret = document.createElement(type);
    if (attr) for (prop in attr)
	ret[prop] = attr[prop];
    if (classes)
	addclass(ret,classes);
    if (val)ret.innerHTML = val;
    return ret;
}

function append(el) {
    var list;
    if (Array.isArray(arguments[1])) list = arguments[1];
    else list = slice(arguments,1,arguments.length);
    list.map(
	function(c){return is$(c) ?  c.el : c;}
    ).map(
	function(c){el.appendChild(c);}
    );
    return el;
}
function rmclass(el) {
    if (Array.isArray(arguments[1]))
	el.classList.remove.apply(el.classList,arguments[1]);
    else
	el.classList.remove.apply(el.classList,
				  slice(arguments,1,arguments.length));
    return el;
}
function addclass(el) {
    if (Array.isArray(arguments[1])) {
	el.classList.add.apply(el.classList,arguments[1]);
    } else {
	el.classList.add.apply(el.classList,
			       slice(arguments, 1, arguments.length));
    }
    return el;
}
function addtempclass(el){
    var args = slice(arguments,1,arguments.length-1);
    var time = arguments[arguments.length-1];
    addclass(el, args);
    setTimeout(function(){
	rmclass(el,args);
    },time);
}

function hasclass(el){
    return el.classList.contains.apply(el.classList,
				       slice(arguments,1,arguments.length));
}
function evlis(el,type,f,pass) {
    (!pass || pass != false) && (pass = true);
    el.addEventListener(type,f,pass);
    return el;
}
function evliss() {
    for(var i=1; i< arguments.length; i+=2)
	evlis(arguments[0], arguments[i], arguments[i+1],false);
    return arguments[0];
}

//insertion convienience
function insert_after(el, before) {
    is$(el)     && (el = el.el);
    is$(before) && (before = before.el);
    before.parentElement.insertBefore(el,before.nextSibling);
}

function insert_before(el, after) {
    el = $toel(el);
    after = $toel(el);
    after.parentElement.insertBefore(el,after);
}
//pruner
function prune(el) {
    while (el.hasChildNodes()) el.removeChild(el.lastChild);
    return el;
}

function inner(el,innert) {
    el = $toel(el);
    if(!innert) return el.innerHTML;
    else {
	el.innerHTML = innert;
	console.log("success");
	return el;
    }
}


//
//my super element wrapper type
//
function _$(el){
    this.el = el;
}
_$.prototype.__iama_$ = true;
_$.prototype.evlis = function(type,f,pass) {
    evlis(this.el, type, f, pass);
    return this;
};
_$.prototype.evliss = function() {
    for(var i=0; i< arguments.length; i+=2)
	evlis(this.el, arguments[i], arguments[i+1], false);
    return this;
};
_$.prototype.addclass = function() {
    addclass.apply(addclass, concat([this.el],slice(arguments)));
    return this;
};
_$.prototype.addtempclass = function() {
    addtempclass.apply(addtempclass, concat([this.el], slice(arguments)));
    return this;
}
_$.prototype.rmclass = function() {
    rmclass.apply(rmclass, concat([this.el],slice(arguments)));
    return this;
};
_$.prototype.hasclass = function() {
    return this.el.classList.contains.apply(this.el.classList,
					    arguments);
};
_$.prototype.id = function() { return idof(this.el); };
_$.prototype.prune = function() { prune(this.el); return this;};

_$.prototype.append = function () {
    append.apply(append,concat([this.el],slice(arguments)));
    return this;
};
_$.prototype.attr  = function () {
    if( arguments.length == 1) return this.el[arguments[0]];
    else for(var i=0; i< arguments.length; i+=2)
	this.el[arguments[i]]=arguments[i+1];
    return this;
};
_$.prototype.insert_before = function(el) {
    insert_before(this.el, before);
    return this;
}
_$.prototype.inner = function(innert) {
    inner(this.el,innert);
    return this;
}
//other goodies
function is$(el) { return el.__iama_$; }

//creation functions
function $(el) {  return !is$(el) ? new _$(el) : el; }
function $toel(el) { return is$(el) ? el.el : el; }
function $byid(id) { return new _$(byid(id));}
function $mkel(a,b,c,d){return $(mkel(a,b,c,d));}


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
if(!(typeof exports === 'undefined')) {
    exports.map = map;
    exports.filter = filter;
    exports.concat = concat;
    exports.reduce = reduce;
    exports.slice = slice;
    exports.has = has;
    exports.last = last;
    exports.setlast = setlast;
}
