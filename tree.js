var ids=0;
//traversing child nodes, avoiding headers...
function getkids(parent){
    return slice($toel(parent).childNodes[1].childNodes);
}
//this isn't very elegant imo...
function allkids(parent){
    var kids = getkids(parent);
    if (!kids.length) return [];
    //don't ask
    return concat.apply(concat,concat([kids], map(kids,allkids)));
}
function maptodivs(parent,f){return getkids(parent).map(f);}
//herpaderp
function return_false(){return false;}

//get the node for the given element
function nodefor(el) {
    return byid(idof(el).match(/(^[0-9]+|root)/)[0]);
}
//drag-and-drop shit

var drag = null;
var Drag = function(src) {
    this.src=src;
    //set all the bad ids
    this.bad_ids= map(allkids(src),idof);
    //letting my old C-ness shine through
    for(var cur=src.parentElement.parentElement;
	idof(cur) !== "root";
	cur=cur.parentElement.parentElement)
	this.bad_ids.push(idof(cur));
    this.bad_ids.push("root");
    this.parent = src.parentElement.parentElement;
    //over state information
    this.overstate = "none";
};
Drag.prototype.valid_target = function (obj) {
    return !has(this.bad_ids, idof(obj));
};
Drag.prototype.finalize = function () {
    del_hide(this.parent);
    this.over_cleanup();
};
Drag.prototype._shift = function(el,inclusive) {
    function getunder(el){
	// this should only be called from visible nodes.
	// It doesn't add children inside other nodes since moving
	// the parent should move the others.
	if (idof(el) == "root") return [];
	//first count the siblings under this
	var parent = el.parentElement;
	var under = parent.childNodes;
	under = slice(under, findfirst(under,el)+1);
	//advance up a level
	parent = parent.parentElement;
	return concat(getunder(parent),under);
    }
    var under = getunder(el);
    if (inclusive)
	under.push(el);
    under.map(function(c){
	addclass(c,"shift-down");
    });
    this.overstate = "shift";
    this.current_over = idof(el);
    this.shifted = under;
    this.before  = inclusive;
}
Drag.prototype.over_shift = function(el,inclusive) {
    var id=idof(el);
    if (this.overstate === "shift"
	&& (this.current_over === id || id === "root"))
	return;
    this.over_cleanup();
    this._shift(el,inclusive);
}
Drag.prototype._insert = function(el) {
    addclass(el, "move-right");
    this.overstate = "insert";
    this.current_over = idof(el);
}
Drag.prototype.over_insert = function(el) {
    var id=idof(el);
    if (this.overstate === "insert"
	&& (this.current_over === id || id === "root"))
	return;
    this.over_cleanup();
    this._insert(el);
}
Drag.prototype.over_cleanup = function() {
    if (this.overstate === "shift") {
	this.shifted.map(function(c){
	    $(c).rmclass("shift-down").addclass("shift-back-up");
	    setTimeout(function(){rmclass(c,"shift-back-up");},200);
	});
	delete this.shifted;
	delete this.before;
    } else if (this.overstate === "insert") {
	var cur = $byid(this.current_over);
	cur.rmclass("move-right").addclass("move-back-left");
	cur = cur.el;
	setTimeout(function(){rmclass(cur,"move-back-left");},200);
    }
    this.overstate = "none";
    this.current_over = null;
}

//drag-and-drop callbacks
function dndstart(e){
    var src = nodefor(e.target);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData('text/html','blarg');
    e.dataTransfer.setDragImage(src,0,0);
    drag = new Drag(src);
}

var area = {
    bottom:0,top:1,insert:2,invalid:3
}
function overarea(target,y){
    var head_rect = byid(idof(target)+"-header").getBoundingClientRect();
    var me_rect   = target.getBoundingClientRect();
    var width = 4;
    if (y > me_rect.bottom-width)
	return area.bottom;
    else if (y < me_rect.top+width)
	return area.top;
    else if (y > head_rect.top+width && y < head_rect.bottom-width)
	return area.insert;
    else
	return area.invalid;
}
function dndover(e){
    if (drag == null)
	return true; //drag not initiated by application
    //restore the guys shifted down before.
    //checking if valid
    var target = nodefor(e.target);
    if(!drag.valid_target(target))
	return false;
    e.preventDefault && e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if(idof(target) == idof(drag.src)) {
	drag.over_cleanup();
	return false;
    }
    //finding whats covered
    var i = overarea(target,e.clientY);
    switch (i) {
	case area.insert:
	    drag.over_insert(target);
	    break;
	case area.top:
	    drag.over_shift(target, true);
	    break;
	case area.bottom:
	    drag.over_shift(target);
	    break;
    }
    return false;
}

function dnddrop(e){
    if (drag == null)
	return true;
    e.stopPropagation && e.stopPropagation();
    if (drag.overstate === "insert") {
	insert_leaf(drag.current_over,drag.src);
	saver.up();
    } else if (drag.overstate === "shift") {
	if (drag.before) {
	    insert_before(drag.src, $byid(drag.current_over));
	} else {
	    insert_after(drag.src, $byid(drag.current_over));
	}
	saver.up();
    } else {console.log("no overstate");}
    drag.finalize();
}

function dndend(e) {
    drag = null;
}

//saver
var saver = saver || {};
    
function $mkbutton(id, hclass, clickf) {
    var ret =
    $mkel("div",{"id":id},
	  concat(['button','active-btn'],hclass),
	  ""
    ).evlis("click",function(){saver.up();});
    if(clickf)ret.evlis("click", clickf);
    return ret;
}
function mkbutton(id, classes, clickf){
    return $mkbutton(id,classes,clickf).el;}

function mkinput(id, classes, val, inputf) {
    var ret =
    $mkel("input",
	  {"id" :id,"value":val,"type" :"input"},
	  classes,""
    ).evlis("input",function(){saver.up();});
    if (inputf) ret.evlis("input", inputf);
    return ret.el;
}
function $mkdiv(id, classes, inner) {
    return $mkel("div", {"id":id}, classes, inner);
}
function mkdiv(id,classes,inner) { return $mkdiv(id,classes,inner).el; }

function mkspan(id, classes, inner) {
    return mkel("span", {"id":id}, classes, inner);
}
function $mkspan(id, classes, inner) {
    return $(mkspan(id,classes,inner));
}
function mkpush_button(id,classes,inner,clickf) {
    var ret = $mkspan(
	id,["button","pushbtn"],inner
    ).addclass(
	classes
    );
    if (clickf) ret.evlis('click',clickf);
    return ret.el;
}

function make_child(parentid,text,skipHide)
{
    ids+=1;
    var myid=ids;
    var child =
    $mkdiv(myid,"node").append(
	/*header*/
	$mkdiv(
	    myid+"-header","header"
	).append(
	    mkinput(myid+"-input","textinput",text)
	).append(
	    $mkdiv(
		myid+"-butts","butbox"
	    ).append(
		//add button
		$mkbutton(myid+"+", "addbutton", function(){make_child(myid,'New Note');}
		).append(
		    mkdiv(myid+"+_1","add1"),mkdiv(myid+"+_2","add2")
		)
	    ).append(
		//rm button
		$mkbutton(myid+"x", "delbutton", function(){del(myid);}
		).append(
		    mkdiv(myid+"+_1","rm1"),mkdiv(myid+"+_2","rm2")
		)
	    ).append(
		$mkbutton(
		    myid+"D","dragbutton"
		).attr(
		    "draggable","true"
		).evliss(
		    "dragstart", dndstart,
		    "dragend", dndend
		)
	    )
	),
	/*children*/
	$mkdiv(
	    myid+"-children"
	)
	/*active buttons*/
    ).el;
    insert_leaf(byid(parentid),child,skipHide)
    return child;
}


function insert_leaf(parent,el,skipHide){
    parent = $toel(parent);
    $byid(idof(parent)+"-children").append(el);
    /*checking if first child*/
    if (getkids(parent).length == 1 && !skipHide) {
	add_hide(parent);
	console.log("success");
    }
}

function focus(id){
    byid(id+"-input").focus();
}

function _visible(hidestate) {
    return !hasclass(hidestate,"hidbutton-show");
}
function kidsvisible(el) {
    return _visible(by(idof(el)+"-"));
}

function add_hide(id) {
    if ( typeof(id) === "object" )
	id = idof(id);
    var hide = byid(id+'-');
    if ( !hide ) {
	hide = $mkbutton(
	    id+"-","hidbutton",function(){hide_toggle(id);}
	).append(
	    mkdiv(id+"-"+"_1","hid1"),mkdiv(id+"-"+"_2","hid2")
	);			    
	insert_before(hide, byid(id+'-input'));
    }
    return hide.el;
}

function del_hide(id) {
    if ( typeof(id) === "object")
	id = idof(id);
    if (!id) return; 
    if (getkids(byid(id)).length == 0)
	byid(id+'-header').removeChild(byid(id+"-"));
}

function show_kids(id) {
    if (typeof(id) == "object") id = idof(id);
    var hbtn = byid(id+"-");
    var children = byid(id+"-children");

    rmclass(hbtn,"hidbutton-show");
    $(children).rmclass("hidden").addclass("visible");
}
function hide_kids(id) {
    if (typeof(id) == "object") id = idof(id);
    var hbtn = byid(id+"-");
    var children = byid(id+"-children");

    addclass(hbtn,"hidbutton-show");
    $(children).rmclass("visible").addclass("hidden");
}

function hide_toggle(id) {
    if (typeof(id) == "object") id = idof(id);
    var hbtn = byid(id+"-");
    if (_visible(hbtn)) {
	hide_kids(byid(id));
	$(hbtn).addclass("hidbutton-show");
    } else {
	show_kids(byid(id));
	$(hbtn).rmclass("hidbutton-show");
    }
}


function save(loginfo) {
    function save_r(el) {
	return {
	    text:     byid(idof(el)+'-input').value,
	    children: maptodivs(el,function(c){ return save_r(c);})
	};
    }
    console.log("saving...");
    
    var data = map(byid('root-children').children, save_r);
    var xhr = mkxhr();
    xhr.onreadystatechange = (function(){
	if (xhr.readyState === 4 && xhr.status === 200) {
	    var res = xhr.responseText;
	    console.log("server response: %s",res);
	    console.log("done saving");
	} else {
	    console.log("error saving");
	}
    });
    xhr.open("POST","/write",true);
    xhr.setRequestHeader('Content-type', 'application/x-www-from-urlencoded');
    xhr.send('data='+encodeURIComponent(JSON.stringify(data))+
	     '&username='+loginfo.uname+
	     '&password='+loginfo.passwd);  
}

function del(me) {
    if ( typeof(me) == "string" || typeof(me) == "number")
	me = byid(me);
    var container = me.parentElement;
    container.removeChild(me);
    del_hide(container.parentElement);
}

function restore_req(loginfo) {
    xhr=mkxhr();
    xhr.onreadystatechange = function() {
	console.log("got response");
	if(xhr.readyState === 4 && xhr.status === 200)
	    restore(xhr.responseText)
    };
    xhr.open("POST","/get",true);
    xhr.send("username="+loginfo.uname+
	     "&password="+loginfo.passwd);
}

function restore(data) {
    
    function restore_r(nodeid,cur,ignorehide/*dirty hack*/) {	
	var child  = make_child(nodeid,cur.text,ignorehide);
	var parent = ids;
	map(cur.children,function(c){
	    restore_r(parent,c);
	});
	return child;
    }
    JSON.parse(data).map(function(c) {
	var child=restore_r("root",c,true);
    });
    getkids(byid("root")).map(function(c) {
	if (getkids(c).length != 0)
	    hide_kids(c);
    });
}

function clean(){ docCookies.removeItem('tree');}

function init() {
    login();
}

function login() {
    var body=document.body;
    var login = mkdiv("login",['modal-diag','drop']);
    login.innerHTML =
    '<form method="post" action="/login" id="loginform">\
      <div>\
       <label for="username">Username:</label><input type="input" name="username" id="username"/>\
      </div>\
      <div>\
       <label for="password">Password:</label><input type="password" name="password" id="password"/>\
      </div>\
      <div id="subbox">\
      </div>\
     </form>';
    function submit(){checklogin(byid("loginform"));return false;}
    body.appendChild(login);
    //haxxorz
    byid('subbox').appendChild(
	mkpush_button("submit",[],'Submit',submit)
    );
    $(byid('loginform')).evlis('keydown',function(e){
	if (e.keyCode === 13) submit();
    });
}

function checklogin(form) {
    xhr=mkxhr();
    //for now...
    var loginfo = {uname:byid("username").value,
		  passwd:byid("password").value};
    xhr.onreadystatechange = function() {
	if (xhr.readyState===4) {
	    if (xhr.status===200) {
		console.log("success");
	    }
	    else if (xhr.status===403) {
		console.log("fail");
		loginfo=null;
	    }
	    var lg = byid('login');
	    $(lg).rmclass("drop").addclass("away");
	    window.setTimeout(function(){
		initapp(loginfo);
	    },1000);
	}
    }
    xhr.open("post", form.action, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-from-urlencoded');
    try { xhr.send("username="+loginfo.uname+
		   "&password="+loginfo.passwd); }
    catch (e) {}
}

function strip(){
    var body = document.body;
    while (body.hasChildNodes())
	body.removeChild(body.lastChild);
}

function notify(message){
    var bg = mkdiv("modalbg",["modal"]);
    document.body.appendChild(bg);
    var diag = mkdiv(
	"diag",["modal-diag","drop"],
	message
    );
    bg.appendChild(diag);
    diag.appendChild(
	mkpush_button("modal-button", [], "ok", function(){
	    $(diag).rmclass("drop").addclass("away");
	    setTimeout(function(){
		document.body.removeChild(bg);
	    },500);
	})
    );
}

function initapp(loginfo,suppressNotify) {
    strip();
    saver = new (function(_loginfo){
	this.num=0;
	this.up = function() {
	    this.num+=1;
	    if ( this.num > 20 ) {
		console.log("auto-saving...");
		save(_loginfo);
		this.num=0;
	    }
	};
    })(loginfo);
    var root = (function(){
	var ret = $mkdiv(
	    "root"
	).append(
	    $mkdiv(
		"root-header"
	    ).append(
		mkpush_button("new", [], "New", function(){
		    make_child('root','New Note',true);})
	    ).append(
		mkpush_button("save", [], "Save",
			      function(){save(loginfo);})
	    )
	).append(
	    $mkdiv(
		"root-children"
	    ).evliss(
		"dragenter", return_false
	    )
	).evliss(
	    "dragover",  dndover,
	    "dragenter", return_false,
	    "drop",      dnddrop
	);
	return ret.el;
    })();
    evlis(window,'keydown',function(e){
	if (e.crtlKey && e.keyCode===83) {
	    e.preventDefault();
	    console.log("save attempt");
	    return false;
	}
    },false);
    document.body.appendChild(root);
    if (!loginfo && !suppressNotify) setTimeout(function(){
	notify("We we're unable to log in...<br/>"
	      +"Data will not be saved.");
    },100);
    else restore_req(loginfo);
}
