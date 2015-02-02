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

//aliases
function byid(id){return document.getElementById(id);}
function idof(el){return el.id;}

//dom stuff
function _$(el){
    this.el = el;
}
function $(el) {return new _$(el);} 

function $byid(id) { return new _$(byid(id));}

function mkel(type, attr, classes, val) {
    var ret = document.createElement(type);
    if (attr) for (prop in attr)
	ret[prop] = attr[prop];
    if (classes)
	map(classes, function(c){return addclass(ret,c);})
    if (val)ret.innerHTML = val;
    return ret;
}
function $mkel(a,b,c,d){return $(mkel(a,b,c,d));}

function rmclass(el) {
    el.classList.remove.apply(el.classList,
			      slice(arguments,1,arguments.length));
    return el;
}
function addclass(el) {
    el.classList.add.apply(el.classList,
			   slice(arguments,1,arguments.length));
    return el;
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
    before.parentElement.insertBefore(el,before.nextSibling);
}

function insert_before(el, after) {
    after.parentElement.insertBefore(el,after);
}


_$.prototype.evlis = function(type,f,pass) {
    evlis(this.el, type, f, pass);
    return this;
};
_$.prototype.addclass = function() {
    this.el.classList.add.apply(this.el.classList,arguments);
    return this;
};
_$.prototype.rmclass = function() {
    this.el.classList.remove.apply(this.el.classList,arguments);
    return this;
};
_$.prototype.hasclass = function() {
    return this.el.classList.contains.apply(this.el.classList,
					    arguments);
}
_$.prototype.id = function() { return idof(this.el); }

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
