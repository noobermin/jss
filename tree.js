var ids=0;

//traversing child nodes, avoiding headers...
function kiddivs(parent){return slice(parent.childNodes[1].childNodes);}
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
    this.parent = src.parentElement.parentElement;
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
    if (!drag.valid_target(dest)) {
	return true;
    }
    var oldparent=drag.src.parentElement.parentElement;
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

//saver
var saver = saver || {};
    
function mkbutton(id, classes, clickf){
    var ret =
    $mkel("span",{"id":id},
	  concat(classes,['button']),""
    ).evlis("click",function(){saver.up();});
    if(clickf)ret.evlis("click", clickf);
    return ret.el;
}

function mkinput(id, classes, val, inputf) {
    var ret =
    $mkel("input",
	  {"id" :id,"value":val,"type" :"input"},
	  classes,""
    ).evlis("input",function(){saver.up();});
    if (inputf) ret.evlis("input", inputf);
    return ret.el;
}
function mkdiv(id, classes, inner) {
    return mkel("div", {"id":id}, classes, inner);
}
function mkspan(id, classes, inner) {
    return mkel("span", {"id":id}, classes, inner);
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
    
    var line = mkinput(myid+"-input",["textinput"],text);
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


function save(loginfo) {
    function save_r(el) {
	return {
	    text:     byid(idof(el)+'-input').value,
	    children: maptodivs(el,function(c){ return save_r(c);})
	};
    }
    console.log("saving...");
    // map(byid('root-children').children,
    // 	save_r
    // ).map(function(c,i){
    // 	docCookies.setItem('tree'+i,JSON.stringify(c),Infinity);
    // });
    
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
    
    function restore_r(nodeid,cur,mkrm/*dirty hack*/)
    {	
	var child  = make_child(nodeid,cur.text,mkrm);
	var parent = ids;
	map(cur.children,function(c){
	    restore_r(parent,c,true);
	});
	return child;
    }
    console.log(data);
    var d=JSON.parse(data);
    console.log(d);
    d.map(function(c) {
	var child=restore_r("root",c,false);
	hide_toggle(idof(child));
    });
    
    /*for(var i=0;docCookies.hasItem('tree'+i);++i) {
	var child=restore_r(
	    "root",
	    JSON.parse(docCookies.getItem('tree'+i)),
	    false
	);
	hide_toggle(idof(child));
    }*/
}

function clean(){ docCookies.removeItem('tree');}

function init() {
    login();
}

function login() {
    var body=document.body;
    var login = mkdiv("login",['modal-diag','drop']);
    login.innerHTML =
    '<form method="post" action="/login" id="loginform"\
      onsubmit="checklogin(this); return false;">\
      <div>\
       <label for="username">Username:</label><input type="input" name="username" id="username"/>\
      </div>\
      <div>\
       <label for="password">Password:</label><input type="password" name="password" id="password"/>\
      </div>\
      <div>\
       <button type="submit" class="textbut">Submit</button>\
      </div>\
     </form>'; 
    body.appendChild(login);
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
	    console.log(lg.classList);
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
	$(mkspan("modal-button",["textbut"],"ok")).evlis(
	    "click",
	    function(){
		$(diag).rmclass(
		    "drop"
		).addclass(
		    "away"
		);
		setTimeout(function(){
		    document.body.removeChild(bg);
		},500);
	    }
	).el);
}

function initapp(loginfo) {
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
    var body=document.body;
    body.appendChild(evlis(
	mkel('input',{id:"new",type:"button",value:"New"}),
	'click', function() {
	    make_child('root','New Note',makeHideButton=false);
	}
    ));
    body.appendChild(evlis(
	mkel('input',{id:"save",type:"button",value:"Save"}),
	'click', function(){save(loginfo);}
    ));
    body.appendChild(mkdiv("root-children"));
    if (!loginfo) setTimeout(function(){
	notify("We we're unable to log in...<br/>"
	      +"Data will not be saved.");
    },100);
    else restore_req(loginfo);
}
