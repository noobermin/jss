var ids=0;

//aliases
function byid(id){return document.getElementById(id);}
function idof(el){return el.getAttribute("id");}
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
function rmclass(el) {
    el.classList.remove.apply(el.classList,
			      slice(arguments,1,arguments.length));
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

//traversing child nodes, avoiding headers...
function iskiddiv(c){return c.nodeName == "DIV";}
function kiddivs(parent){
    return slice(parent.childNodes[1].childNodes);
}
//this isn't very elegant imo...
function allkids(parent){
    var kids = kiddivs(parent);
    if (!kids.length) return [];
    //don't ask
    return concat.apply(concat,concat([kids], map(kids,allkids)));
}
function maptodivs(parent,f){return kiddivs(parent).map(f);}
//drag-and-drop shit
var drag=null;

var Drag = function(src) {
    this.src=src;
    this.kid_ids=map(allkids(src),idof);
    this.parent = src.parentElement;
    console.log(this.kid_ids);
    console.log(this.src);
};
Drag.prototype.valid_target = function (obj) {
    var objid = idof(obj);
    var ret = idof(this.src) != objid && !has(this.kid_ids,objid);
    return ret;
};
Drag.prototype.finalize = function () {
    del_hide(this.parent);
};

//Drag also doubles as a namespace for drag and drop functions
Drag.start = function(e){
    var src = e.target.parentElement.parentElement.parentElement;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData('text/html','blarg');
    e.dataTransfer.setDragImage(src,0,0);
    drag = new Drag(src);
};
Drag.over = function(e){
    if (drag == null)
	return true; //drag not initiated by application
    var target = e.target;
    if (!hasclass(e.target,"header"))
	return true;
    e.preventDefault && e.preventDefault();
    var dest = target.parentElement;
    if ( !drag.valid_target(dest)) //we are over an inactive element
	return false;
    e.dataTransfer.dropEffect = "move";
    //getting
    var i = overarea(e.target.getBoundingClientRect(),e.clientY);
    rmclass(e.target,"overtop","overmid","overbot");
    if (i==-1)
	addclass(e.target,"overbot");
    else if (i==0)
	addclass(e.target,"overmid");
    else
	addclass(e.target,"overtop");
};
Drag.leave = function(e){
    if (drag == null)
	return true;
    rmclass(e.target,"overtop","overmid","overbot");
};
Drag.drop = function(e){
    if (drag == null)
	return true;
    e.stopPropagation && e.stopPropagation();
    var target = e.target;
    if (!hasclass(e.target,"header"))
	return true;
    var dest = e.target.parentElement;
    console.log(dest);
    if (!drag.valid_target(dest)) {
	return true;
    }
    var i = overarea(target.getBoundingClientRect(),e.clientY);	
    if (i == 1) {
	insert_before(drag.src,dest);
    } else if (i == -1) {
	insert_after(drag.src,dest);
    } else {
	dest.childNodes[1].appendChild(drag.src);
	var hide = add_hide(dest);
	if (hide && hasclass(drag.src,"hidbutton-show"))
	    _hide(drag.src);
    }
    drag.finalize();
    saver.up();
    rmclass(target,"overtop","overtop","overbot");
};
Drag.end = function(e) {
    drag = null;
};



//auto-save
var saver = saver || {};

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

//make elements
function mkel(type, attr, classes, val) {
    var ret = document.createElement(type);
    if (attr) for (prop in attr)
	ret[prop] = attr[prop];
    if (classes)
	map(classes, function(c){return addclass(ret,c);})
    if (val)ret.innerHTML = val;
    return ret;
}
    
function mkbutton(id, classes, clickf){
    var ret = mkel("span", {"id":id}, classes, "");
    addclass(ret,'button');
    evlis(ret,"click",function(){saver.up();});
    if(clickf) evlis(ret,"click", clickf);
    return ret;
}

function mkinput(id, classes, val, inputf) {
    var ret = mkel("input",
		   {"id" :id,"value":val,"type" :"input"},
		   classes,
		   "");
    evlis(ret,"input",function(){saver.up();});
    if (inputf) evlis(ret, "input", inputf);
    return ret;
}
function mkdiv(id, classes, inner) {
    return mkel("div", {"id":id}, classes, inner);
}

//insertion convienience
function insert_after(el, before) {
    before.parentElement.insertBefore(el,before.nextSibling);
}

function insert_before(el, after) {
    after.parentElement.insertBefore(el,after);
}


function mkoverarea(s){
    return (function (r,y)
	    { var w = (r.bottom - r.top)/s
	      if (y > r.bottom-w) return -1;
	      else if (y < r.top+w) return 1;
	      else return 0;
	    });
}
overarea = mkoverarea(4);

function make_child(parentid,text,makeHideButton=true)
{
    ids+=1;
    var myid=ids;
    var child = mkdiv(myid,["node"]);
    var header = mkdiv(myid+"-header",["header"]);
    var grandkids = mkdiv(myid+"-children");
    child.appendChild(header);
    child.appendChild(grandkids);
    
    var line = mkinput(myid+"-input",[],text);
    header.appendChild(line);

    var butbox = mkdiv(myid+"-butts",["butbox"]);
    header.appendChild(butbox);
    
    //add button
    butbox.appendChild(
	mkbutton(myid+"+",["addbutton"],
		 function(){make_child(myid,'New Note');})
    );
    //del button
    butbox.appendChild(
	mkbutton(myid+"x",["delbutton"],
		 function(){del(myid);})
    );

    //setting up drag and drop
    //drag button
    var drag = mkbutton(myid+"D",["dragbutton"]);
    butbox.appendChild(drag);
    drag.draggable=true;

    evliss(drag,
	   "dragstart", Drag.start,
	   "dragend", Drag.end);
    
    evliss(header,
	   "dragover", Drag.over,
	   "dragleave",Drag.leave,
	   "drop",     Drag.drop);


    var parent_container = byid(parentid+"-children");
    parent_container.appendChild(child);
    //getting hide state
    var hide;
    if (makeHideButton)
	hide = add_hide(parentid);
    if (hide && hasclass(hide,"hidbutton-show") )
	_hide(child);
    else 
	line.focus();
    return child;
}

function add_hide(id) {
    if ( typeof(id) == "object" )
	id = idof(id);
    var hide = byid(id+'-');
    if ( !hide ) {
	hide = mkbutton(id+"-",["hidbutton"],function(){hide_toggle(id);});
	byid(id+'-header').insertBefore(hide, byid(id+'-input'));
    }
    return hide;
}

function del_hide(id) {
    if ( typeof(id) == "object")
	id = idof(id);
    if (!id) return; 
    if ( kiddivs(byid(id)).length == 0)
	byid(id+'-header').removeChild(byid(id+"-"));
}

function _show(el,children) {
    rmclass(el,"hidbutton-show");
    rmclass(children,"hidden");
    addclass(children,"visible");
}
function _hide(el,children) {
    addclass(el,"hidbutton-show");
    rmclass(children,"visible");
    addclass(children,"hidden");
}

function hide_toggle(id) {
    if (typeof(id) == "object") id = idof(id);
    var hidebutton = byid(id+'-');
    if (!hidebutton) return;
    var hidden = hasclass(hidebutton,"hidbutton-show");
    var children = byid(id+"-children");
    //setting state
    
    if (hidden) _show(hidebutton,children);
    else _hide(hidebutton,children);
}


function save() {
    function save_r(el) {
	return {
	    text:     byid(idof(el)+'-input').value,
	    children: maptodivs(el,function(c){ return save_r(c);})
	};
    }
    var trees = map(byid('root-children').children,function(c){return save_r(c);});
    
    docCookies.setItem('tree', JSON.stringify(trees), Infinity);
}

function del(me) {
    if ( typeof(me) == "string" || typeof(me) == "number")
	me = byid(me);
    var container = me.parentElement;
    container.removeChild(me);
    del_hide(container.parentElement);
}

function restore()
{
    function restore_r(nodeid,cur,mkrm/*dirty hack*/)
    {	
	var child  = make_child(nodeid,cur.text,mkrm);
	var parent = ids;
	map(cur.children,function(c){
	    restore_r(parent,c,true);
	});
	return child;
    }
    
    var c = JSON.parse(docCookies.getItem('tree'));
    if (!c) return;
    map(c,function(cur){
	var child = restore_r("root",cur,false);
	hide_toggle(idof(child));
    });
}

function clean(){ docCookies.removeItem('tree');}

function init()
{
    saver = new (function(){
	this.num=0;
	this.up = function() {
	    this.num+=1;
	    if ( this.num > 15 ) {
		console.log("auto-saving...");
		save();
		this.num=0;
	    }
	};
    })();
    
    restore();
    evlis(byid("new"),'click', function(){
	make_child('root','New Note',makeHideButton=false);
    });
    evlis(byid("save"),'click', function(){
	save();
    });
    evlis(byid("clean"),'click', function(){
	clean();
    });
}
