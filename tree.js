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

function insert_leaf(parent,el,skipHide){
    parent = $toel(parent);
    $byid(idof(parent)+"-children").append(el);
    focus(el);
    /*checking if first child*/
    if (getkids(parent).length > 0 && !skipHide)
	rmclass(parent, "childless");
    
}

function focus(id){
    if (typeof id === "object") id = idof(id);
    byid(id+"-input").focus();
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
		    skipHide,noanimate)
{
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
		function(){hide_toggle(child,root);}
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
		    function(){del(child,root);}
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
	    ).append(
		$mkdiv("herpaderp"+myid,"",myid)
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
    if (!noanimate) {
	addclass(child,"new");
	setTimeout(function(){rmclass(child,"new");},300);
    }
    insert_leaf(parent,child,skipHide);
    return child;
}

function hide_toggle(node, root) {
    var id = idof(node);
    var hbtn = byid(id+"-");
    if (_visible(hbtn)) {
	hide_kids(node);
	$(hbtn).addclass("hidbutton-show");
    } else {
	show_kids(node);
	$(hbtn).rmclass("hidbutton-show");
    }
    root.update_visible();
}

function del(me,root) {
    if ( typeof(me) == "string" || typeof(me) == "number")
	me = byid(me);
    root.rm(me);
}

function save(root,loginfo) {
    function save_r(el) {
	return {
	    text:     byid(idof(el)+'-input').value,
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
	var child  = make_child(node, cur.text, root, ignorehide,true);
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
    root.update_visible();
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
    function _visible_kids_bad(cur) {
	var kids = getkids(cur);	
	if (!kids.length) return [];
	return concatv(kids, kids.filter(function(c){
	    return kidsvisible(c);
	}).map(_visible_kids));
    }
    function _visible_kids_dfs(cur) {
	var ret=[], kids=getkids(cur);
	for (var i = 0; i < kids.length; ++i) {
	    ret = ret.concat(kids[i]);
	    if (kidsvisible(kids[i]))
		ret = ret.concat(_visible_kids_dfs(kids[i]));
	}
	return ret;
    }
    return _visible_kids_dfs(parent);
}

function tempmove(el,dr,transtime) {
    var movestyle ="transform: \
translateY("+dr.y+"px)\
translateX("+dr.x+"px);";
    if (transtime) movestyle+="transition: "+transtime+"s ease-in;";
    el.style = movestyle;
}

const area = {
    bottom:0,top:1,insert:2,invalid:3
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
	    this.offset = {
		x:e.clientX-tmp.x, y:e.clientY-tmp.y
	    };
	};
	app.overarea = function(e) {
	    var y = e.clientY;
	    //getting the element over
	    var i = Math.floor((y-58)/40);
	    if (i < 0 || i > this.visible.length-1) return;
	    var over = this.visible[i];
	    var over_rect = over.getBoundingClientRect(),
		head_rect = byid(idof(over)+"-header").getBoundingClientRect();
	    var width = 4;
	    var retarea;
	    if (y > over_rect.bottom-width)
		retarea = area.bottom;
	    else if (y < over_rect.top+width)
		retarea = area.top;

	    else if (y > head_rect.top+width && y < head_rect.bottom-width)
		retarea = area.insert;
	    else
		retarea = area.invalid;
	    return {area:retarea, target:over, i:i};
	}
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
		    this.el.appendChild(this.movee);
		    delete this.possible;
		    addclass(this.movee, "above");
		    this.undropable = visiblekids(this.movee).map(idof);
		    this.update_visible();
		}
	    }
	    var dr = {x:e.clientX-this.offset.x-20,
		      y:e.clientY-this.offset.y-20};
	    tempmove(this.movee,dr);
	    var over = this.overarea(e);
	    if (!over || !this.valid_target(over.target)) return;
	    if (over.target == this.movee) {this.over_cleanup(); return;}
	    switch (over.area) {
	    case area.insert:
		this.over_insert(over.target);
		break;
	    case area.top:
		this.over_shift(over.target, over.i,true);
		break;
	    case area.bottom:
		this.over_shift(over.target, over.i);
		break;
	    }
	};
	app.update_visible = function() {
	    this.visible = visiblekids(this.el);
	};
	function unmove(el){
	    setTimeout(function(){
		el.style="transform: translateY(0px) translateX(0px); transition: 0.2s ease-in;";
	    },1);
	    setTimeout(function(){
		el.style="";
	    },300);

	}
	app.end_move = function(e) {
	    if(!this.movee) return;
	    if (this.overstate === "insert") {
		insert_leaf($byid(this.current_over), this.movee);
		saver.up();
	    } else if (this.overstate === "shift") {
		var insertf = this.before ? insert_before : insert_after;
		var current = this.movee.getBoundingClientRect();
		var over = $byid(this.current_over).el;
		var newpos = over.getBoundingClientRect();
		rmclass(this.movee,"above");
		insertf(this.movee, over);
		
		tempmove(this.movee,
			 {
			     x:current.x-44,
			     y:current.y-newpos.y+(this.before?40:0)
			 }
		);
		unmove(this.movee);
		saver.up();
	    } else {console.log("no overstate");}
	    delete this.movee;
	    check_hide(this.oldcontext.parent);
	    this.over_cleanup(true);
	    this.update_visible();
	};
	app.valid_target = function (obj) {
	    return !has(this.undropable, idof(obj));
	};
	app.over_shift_old = function(el,i,inclusive) {
	    var id=idof(el);
	    if (this.overstate === "shift"
		&& (this.current_over === id || id === "root"))
		return;
	    if (!inclusive)++i;
	    var under = this.visible.slice(i,this.visible.length);
	    this.over_cleanup();
	    under.map(function(c){
		addclass(c,"shift-down");
	    });
	    this.overstate = "shift";
	    this.current_over = idof(el);
	    this.shifted = under;
	    this.before  = inclusive;
	};
	app.over_shift = function(el,i,inclusive) {
	    var id=idof(el);
	    if (this.overstate === "shift"
		&& (this.current_over === id || id === "root"))
		return;
	    
	    var tmp = $mkdiv("temp",["temp","new"]);
	    this.over_cleanup();
	    if (inclusive) insert_before(tmp,el);
	    else insert_after(tmp,el);
	    this.overstate = "shift";
	    this.current_over = id;
	    this.before  = inclusive;
	};
	app.over_insert = function(el) {
	    var id=idof(el);
	    if (this.overstate === "insert"
		&& (this.current_over === id || id === "root"))
		return;
	    app.over_cleanup();
	    addclass(el, "move-right");
	    this.overstate = "insert";
	    this.current_over = idof(el);
	};
	app.over_cleanup = function(instant) {
	    if (this.overstate === "shift") {
		var undofunc;
		var temp = $byid("temp");
		if(!instant) {
		    temp.addclass("shrink");
		    setTimeout(function(){
			temp.el.parentElement.removeChild(temp.el);
		    },200);
		} else {
		    temp.el.parentElement.removeChild(temp.el);
		}
			   /*
		if (!instant) {
		    undofunc = (function(c){
			$(c).rmclass("shift-down").addclass("shift-back-up");
			setTimeout(function(){
			    rmclass(c,"shift-back-up")
			},200);
		    });
		} else {
		    undofunc = (function(c){
			rmclass(c,"shift-down");
		    });
		}
		this.shifted.map(undofunc);*/
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
	app.rm = function(el) {
	    this.update_visible();
	    var parent = parentof(el);
	    var container = el.parentElement;
	    var i = findfirst(this.visible,el);
	    if (i < 0) return;
	    addclass(el,"erase");
	    setTimeout(function(){
		container.removeChild(el);
		check_hide(parent);
	    },300);
	    this.update_visible();
	}
	restore_req(app, loginfo);

	saver = new (function(_root,_loginfo){
	    this.num=0;
	    this.up = function() {
		this.num+=1;
		if ( this.num > 20 ) {
		    console.log("auto-saving...");
		    save(_root,_loginfo);
		    this.num=0;
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
