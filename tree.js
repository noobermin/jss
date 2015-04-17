var ids=0;
//traversing child nodes, avoiding headers...
function getkids(parent){
    return slice($toel(parent).childNodes[1].childNodes);
}
//get the parent of the child
function parentof(child){
    return nodefor(nodefor(child).parentElement);
}
//herpaderp, trivial callback
function return_false(){return false;}

//get the node element for the given sub-element
function nodefor(el) {
    return byid(idof(el).match(/(^[0-9]+|root)/)[0]);
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
    var ret = $mkdiv(
	id,concat(["textinput"],classes), val
    ).attr(
	"contentEditable","true"
    ).evlis("input",function(){saver.up(0.2);});
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

function select_contents(el) {
    el = $toel(el);
    var r = document.createRange();
    r.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
}

function insert_leaf(parent,el,skipHide,noFocus){
    parent = $toel(parent);
    $byid(idof(parent)+"-children").append(el);
    if (!noFocus) focus(el);
    /*checking if first child*/
    if (getkids(parent).length > 0 && !skipHide)
	rmclass(parent, "childless");
    
}

function focus(id){
    if (typeof id === "object") id = idof(id);
    var el = byid(id+"-input");
    el.focus();
    select_contents(el);
}

function _visible(hidestate) {
    return !hasclass(hidestate,"hidbutton-show");
}
function kidsvisible(el) {
    return byid(idof(el)+"-") && _visible(byid(idof(el)+"-"));
}

function check_hide(parent) {
    if (getkids(parent).length == 0)
	addclass(parent,"childless");
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

function make_child(parent,text,root,
		    skipHide,noAnimate,noFocus) {
    ids++;
    var myid=ids;
    var child = $mkdiv(myid,"node").append(
	/*header*/
	$mkdiv(
	    myid+"-header","header"
	).append(
	    /*hide button*/
	    $mkbutton(
		myid+"-","hidbutton",
		function(){hide_toggle(child);}
	    ).append(
		mkdiv(myid+"-"+"_1","hid1"), mkdiv(myid+"-"+"_2","hid2")
	    )
	).append(
	    /*text input*/
	    mkinput(myid+"-input","textinput",text)
	).append(
	    $mkdiv(
		/*button box*/
		myid+"-butts","butbox"
	    ).append(
		//add button
		$mkbutton(
		    myid+"+", "addbutton",
		    function(){make_child(child,'New Note',root);}
		).append(
		    mkdiv(myid+"+_1","add1"),mkdiv(myid+"+_2","add2")
		)
	    ).append(
		//rm button
		$mkbutton(
		    myid+"x", "delbutton",
		    function(){del(child,skipHide);}
		).append(
		    mkdiv(myid+"+_1","rm1"),mkdiv(myid+"+_2","rm2")
		)
	    ).append(
		//move tart button
		$mkbutton(
		    myid+"M","dragbutton"
		).evliss(
		    "mousedown", function(e){return root.start_move(e);}
		)
	    )
	),
	/*children*/
	$mkdiv(
	    myid+"-children"
	)
	/*new kids do not have children*/
    ).addclass(
	"childless"
    ).el;
    if (!noAnimate) {
	addclass(child,"new");
	setTimeout(function(){rmclass(child,"new");},300);
    }
    insert_leaf(parent,child,skipHide,noFocus);
    return child;
}

function del(el,skipHide) {
    var parent = parentof(el);
    var container = el.parentElement;
    addclass(el,"erase");
    setTimeout(function(){
	container.removeChild(el);
	if(!skipHide)
	    check_hide(parent);
    },300);
}

function hide_toggle(node) {
    var id = idof(node);
    var hbtn = byid(id+"-");
    if ($(node).hasclass("childless")) return;
    if (_visible(hbtn)) {
	hide_kids(node);
	$(hbtn).addclass("hidbutton-show");
    } else {
	show_kids(node);
	$(hbtn).rmclass("hidbutton-show");
    }
}

function save(root,loginfo) {
    function save_r(el) {
	return {
	    text:     byid(idof(el)+'-input').innerHTML,
	    children: getkids(el).map(function(c){ return save_r(c);})
	};
    }
    console.log("saving...");
    
    var data = getkids(root).map(save_r);
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

function restore_req(root,loginfo) {
    xhr=mkxhr();
    xhr.onreadystatechange = function() {
	console.log("got response");
	if(xhr.readyState === 4 && xhr.status === 200)
	    restore(root, xhr.responseText);
    };
    xhr.open("POST","/get",true);
    xhr.send("username="+loginfo.uname+
	     "&password="+loginfo.passwd);
}

function restore(root, data) {
    function restore_r(node,cur,ignorehide) {	
	var child  = make_child(node, cur.text, root,
				ignorehide, true, true);
	cur.children.map(function(c){
	    restore_r(child, c);
	});
	return child;
    }
    JSON.parse(data).map(function(c) {
	var child=restore_r(root,c,true);
    });
    getkids(root.el).map(function(c) {
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

//obtain a list of visible
function visiblekids(parent) {
    function _visible_kids(cur) {
	var ret=[], kids=getkids(cur);
	for (var i = 0; i < kids.length; ++i) {
	    ret = ret.concat(kids[i]);
	    if (kidsvisible(kids[i]))
		ret = ret.concat(_visible_kids(kids[i]));
	}
	return ret;
    }
    return _visible_kids(parent);
}

function tempmove(el,dr,transtime) {
    var movestyle ="translateX("+dr.x+"px) translateY("+dr.y+"px)";
    if (el.style.webkitTransform)
	el.style.webkitTransform = movestyle;
    else
	el.style.transform = movestyle;
    if (transtime) {
	movestyle=transtime+"s ease-in"
	if (el.style.webkitTransition)
	    el.style.webkitTransition = movestyle;
	else
	    el.style.transition = movestyle;
    }
}

function initapp(loginfo,suppressNotify) {
    strip();
    if (!loginfo && !suppressNotify) setTimeout(function(){
	notify("We we're unable to log in...<br/>"
	       +"Data will not be saved.");
    },100);
    var root = (function(){
	/*we first create the data*/
	var app = $mkdiv(
	    "root"
	).append(
	    $mkdiv(
		"root-header","root-header"
	    ).append(
		mkpush_button("new", [], "New", function(){
		    make_child(app.el,'New Note', app, true);})
	    ).append(
		mkpush_button("save", [], "Save",
			      function(){save(app.el, loginfo);})
	    )
	).append(
	    $mkdiv(
		"root-children"
	    )
	).evliss(
	    "mousemove", function(e){app.move(e);},
	    "mouseup", function(e){app.end_move(e);}
	);
	/*then, we create the methods*/
	app.start_move = function(e) {
	    this.possible = nodefor(e.target);
	    var tmp = this.possible.getBoundingClientRect();
	    console.log(tmp);
	    this.offset = {
		x:e.clientX-tmp.left, y:e.clientY-tmp.top
	    };
	};	
	const overlap = {
	    notin:0, inbody:1, inhead:2, inall:3
	}
	function insidebox(x, y, body, head) {
	    /*
	    if (y.constructor && y.constructor === DOMRect) {
		head = body;
		body = y;
		var tmp = x;
		x = tmp.x;
		y = tmp.y;
	    }*/
	    var ret=0;
	    if(y > body.top && y < body.bottom && x > body.left && y < body.right)
		ret |= overlap.inbody;
	    if(y > head.top && y < head.bottom && x > head.left && y < head.right)
		ret |= overlap.inhead;
	    return ret;
	}
	//const area = {
	//    bottom:0,top:1, insert:2,invalid:3
	//}
	app.overarea = function(e) {
	    var x=e.clientX,y=e.clientY;
	    var matches = this.visible.map(function(c){
		return insidebox(e.clientX, e.clientY, c.body,c.head);
	    });
	    var head=true;
	    var i = findfirst(matches, function(c){
		return c & overlap.inhead;
	    });
	    if (i==-1) {
		i = findfirst(matches, function(c){
		    return c & overlap.inbody;
		});
		head = false;
	    }
	    if (i==-1) return;
	    //getting the element over
	    const width=4;
	    var over = this.visible[i];
	    if (y > over.body.bottom-width)
		retarea = this.overarea.bottom;
	    else if (y < over.body.top+width)
		retarea = this.overarea.top;
	    else if (y > over.head.top+width && y < over.head.bottom-width)
		retarea = this.overarea.insert;
	    else
		retarea = this.overarea.invalid;
	    return {area:retarea, target:byid(over.id), i:i};
	};
	app.overarea.bottom=0;
	app.overarea.top=1;
	app.overarea.insert=2;
	app.overarea.invalid=3;

	app.move = function(e) {
	    if(!this.movee) {
		if(!this.possible) {
		    return;
		} else {
		    this.movee = this.possible;
		    this.oldcontext = {
			parent : parentof(this.movee),
			after : this.movee.nextSibling
		    };
		    this.append(this.movee);
		    delete this.possible;
		    addclass(this.movee, "above");
		    this.undropable = visiblekids(this.movee).map(idof);
		    //create the "visible kids" thing
		    this.visible = visiblekids(
			this.el
		    ).map(function(c){
			var id = idof(c);
			var box = c.getBoundingClientRect(),
			    head = byid(idof(c)+"-header").getBoundingClientRect();
			return {
			    id : id,
			    body: c.getBoundingClientRect(),
			    head: byid(id+"-header").getBoundingClientRect()
			};
		    });
		    
		}
	    }
	    var dr = {x:e.clientX-this.offset.x-20,
		      y:e.clientY-this.offset.y-20};
	    tempmove(this.movee,dr);
	    var over = this.overarea(e);
	    if (!over || !this.valid_target(over.target)) return;
	    switch (over.area) {
	    case this.overarea.insert:
		this.over_insert(over.target);
		break;
	    case this.overarea.top:
		this.over_shift(over.target, true);
		break;
	    case this.overarea.bottom:
		this.over_shift(over.target);
		break;
	    }
	};
	app.valid_target = function (obj) {
	    return !has(this.undropable, idof(obj));
	};
	app.over_shift = function(el, inclusive) {
	    var id=idof(el);
	    if (this.overstate === "shift") {
		return;
	    }
	    this.over_cleanup();
	    var tmp = $mkdiv("temp",["temp","new"]);
	    if (inclusive) insert_before(tmp,el);
	    else insert_after(tmp,el);
	    this.overstate = "shift";
	    this.current_over = id;
	    this.before = inclusive;
	};
	app.over_insert = function(el) {
	    var id=idof(el);
	    if (this.overstate === "insert"
		&& (this.current_over === id || id === "root"))
		return;
	    this.over_cleanup();
	    addclass(el, "move-right");
	    this.overstate = "insert";
	    this.current_over = idof(el);
	};
	app.over_cleanup = function(instant) {
	    if (this.overstate === "shift") {
		var undofunc;
		var temp = $byid("temp");
		if(!instant) {
		    temp.addclass("erase");
		    setTimeout(function(){
			console.log(temp.el.parentElement);
			temp.el.parentElement.removeChild(temp.el);
		    },200);
		} else {
		    temp.el.parentElement.removeChild(temp.el);
		}
		delete this.before;
	    } else if (this.overstate === "insert") {
		var cur = $byid(this.current_over);
		cur.rmclass("move-right").addclass("move-back-left");
		cur = cur.el;
		setTimeout(function(){rmclass(cur,"move-back-left");},200);
	    }
	    this.overstate = "none";
	    this.current_over = null;
	};
	app.end_move = function(e) {
	    if(!this.movee) return;
	    var current = this.movee.getBoundingClientRect();
	    var over = byid(this.current_over);
	    var newpos = over.getBoundingClientRect();
	    rmclass(this.movee,"above");

	    if (this.overstate === "insert") {
		insert_leaf($byid(this.current_over), this.movee);
		saver.up();
	    } else if (this.overstate === "shift") {
		if (this.before)
		    insert_before(this.movee,over);
		else
		    insert_after(this.movee,over);
	    } else {
		console.log("no overstate");
	    }
	    tempmove(this.movee, {
		x:current.x-44,
		y:current.y-newpos.y+(this.before?40:0)
	    });
	    var tmp = this.movee;
	    setTimeout(function(){
		tmp.style.transform = "";
		tmp.style.webkitTransform = "";
		tmp.style.transition = "";
		tmp.style.webkitTransition = "";
	    },1);
	    setTimeout(function(){
		tmp.style="";
	    },300);
	    saver.up();
	    delete this.movee;
	    check_hide(this.oldcontext.parent);
	    this.over_cleanup(true);
	};
	restore_req(app, loginfo);

	saver = new (function(_root,_loginfo){
	    this.num=0;
	    this.up = function(val) {
		if (!val) val=1;
		this.num+=val;
		if ( this.num > 10 ) {
		    console.log("auto-saving...");
		    save(_root,_loginfo);
		    this.num = 0;
		}
	    };
	})(app.el,loginfo);
	
	return app.el;
    })();
    document.body.appendChild(root);
    
    evlis(window,'keydown',function(e){
	if (e.crtlKey && e.keyCode===83) {
	    e.preventDefault();
	    e.stopPropagation();
	    console.log("save attempt");
	    return false;
	}
    },false);
}
