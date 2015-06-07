var ids=0;
const em2px = 16;
const headerw = 16,
      headerh = 1.25;
importinto(array,window);
importinto(dom,window);
importinto($dom,window);


//traversing child nodes, avoiding headers...
function getkids(parent){
    return slice($toel(parent).childNodes[1].childNodes);
}

//obtain a list of visible, traverses whole tree
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
function visible_immediate_kids(parent) {
    return getkids(parent).filter(function(c) {
        return kidsvisible(c);
    });
}

//get the depth of visible children
function maxdepth(el,d) {
    if (d === undefined)
        d=0;
    if (visible_immediate_kids(el).length === 0)
        return d;
    return Math.max.apply(
        null, visible_immediate_kids(
            el
        ).map(function(c){
            return maxdepth(c,d+1);
        })
    );
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
	  concat(['button','active-btn'], hclass),
	  ""
    ).evlis("click",function(){saver.up();});
    if(clickf)ret.evlis("click", clickf);
    return ret;
}
function mkbutton(id, classes, clickf){
    return $mkbutton(id,classes,clickf).el;}

function mkinput(id, classes, val, inputf) {
    var ret = $mkdiv(
	    id, "textinput", val
    ).attr(
	    "contentEditable","true"
    ).evlis("input",function(){saver.up(0.2);});
    if (classes) ret.addclass(classes);
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
function $mkpush_button(id,classes,inner,clickf) {
    var ret = $mkspan(
	    id, concat(["button","pushbtn"]), inner
    );
    if (classes) addclass(ret,classes);
    if (clickf) ret.evlis('click',clickf);
    return ret;
}
function mkpush_button(id,classes,inner,clickf) {
    return $mkpush_button(id,classes,inner,clickf).el;
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

function kidsvisible(el) {
    return !hasclass(el,"hidekids");
}

function check_hide(parent) {
    if (getkids(parent).length == 0)
	addclass(parent,"childless");
}
function prop2num(el,prop,pref){
    if (pref) {
        return Number(el.style[prop].replace(pref,""));
    } else {
        return Number(el.replace(prop,""));
    }
}

//I copy jquery...
function anim(el, prop, to, time, done) {
    el = $toel(el);
    var from,post=null,steps=40;
    if (el.style[prop] === undefined) {
        console.warn("%o's %s property is undefined.",el,prop);
        return null;
    }
    if (typeof el.style[prop] === "string") {
        if (el.style[prop].match("em")) {
            post = "em";
        } else if (el.style[prop].match("px")) {
            post = "px";
        }
        from = prop2num(el, prop, post);
        to   = prop2num(to, post);
    } else if (typeof el.style[prop] === "number") {
        from = el.style[prop];
    }
    var lasttime = Date.now();
    var dx = (to-from)/steps, cur = from;
    var lastime
    var interval;
    var f = dx > 0 ?
            (function(){
                var dt = Date.now()-lasttime;
                cur += (to-from) * dt/time;
                lasttime = Date.now();
                el.style[prop] = cur + post;
                if (cur >= to) {
                    clearInterval(interval);
                    if (done) done(el);
                }
            })
        :
            (function(){
                var dt = Date.now()-lasttime;
                cur += (to-from) * dt/time;
                lasttime = Date.now();
                el.style[prop] = cur + post;
                if (cur <= to) {
                    clearInterval(interval);
                    if (done) done(el);
                }
            });
    interval = setInterval(f,time/steps);
}

function show_kids(el,animate) {
    if (typeof(el) == "string") el = byid(el);
    el = $toel(el);
    var maxheight = visiblekids(el).length * 2.5,
        maxwidth  = maxdepth(el) + headerw,
        children = byid(idof(el)+"-children"),
        w = false;
    $(el).rmclass("hidekids");
    if (animate) {
        children.style.maxWidth="16em";
        children.style.maxHeight="0.02em";
        children.style.overflow="hidden";
        anim(
            children,
            "maxWidth",maxwidth+"em",75,
            function(el){
                anim(
                    children,
                    "maxHeight",maxheight+"em",150,
                    function(el){
                        el.style = "";
                    }
                );
            }
        );
    }
}

function hide_kids(el,animate) {
    if (typeof(el) == "string") el = byid(el);
    el = $toel(el);
    var maxheight = visiblekids(el).length * 2.5,
        maxwidth  = maxdepth(el) + 16,
        children = byid(idof(el)+"-children");
    if (animate) {
        children.style.maxWidth =maxwidth+"em"
        children.style.maxHeight=maxheight+"em";
        children.style.overflow="hidden";
        anim(
            children,
            "maxHeight","0em",150,
            function(){
                anim(
                    children,
                    "maxWidth","0em",75,
                    function(){
                        addclass(el,"hidekids");
                    }
                );
            }
        );
    } else {
        $(el).addclass("hidekids");
    }
}

function make_child(parent,text,root,skipHide,noAnimate,noFocus) {
    ids++;
    var myid  = ids;
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
	        myid+"-children","children"
	    )
	        /*new kids do not have children*/
    ).addclass(
	    "childless"
    ).el;
    if (!noAnimate)
        addtempclass(child,"new",300);
    insert_leaf(parent,child,skipHide,noFocus);
    return child;
}

function del(el,skipHide) {
    var parent = parentof(el);
    $(el).rmel("erase", 300, function(){
	    if(!skipHide)check_hide(parent);
    });
}

function hide_toggle(el) {
    el = $(el);
    if (el.hasclass("childless")) return;
    if (kidsvisible(el))
        hide_kids(el,true);
    else
        show_kids(el,true);
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
    if(!loginfo) return;
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
    function restore_r(node,cur,ignorehide)
    {	
	 var child  = make_child(node, cur.text, root,
				             ignorehide, true, true);
	    cur.children.map(function(c){
	        restore_r(child, c);
	    });
	    return child;
    }
    JSON.parse(data).map(function(c){restore_r(root,c,true);});
    getkids(root.el).map(function(c) {
	    if (getkids(c).length != 0)	hide_kids(c);
    });
}

function init() {
    login();
}

function login() {
    var body=document.body;
    function submit(){checklogin(byid("loginform"));return false;}
    var login = $mkdiv(
        "login",['modal-diag','drop']
    ).append(
        $mkel(
            "form",
            {"method":"post","action":"/login","id":"loginform"}
        ).evlis('keydown',function(e){
            if (e.keyCode === 13) submit();
        }).append(
            $mkdiv("").append(
                $mkel("label",{"for":"username"},null,"Username:"),
                $mkel("input",
                      {"type":"input","name":"username","id":"username"},
                      null,
                      "Username:"
                )
            ),
            $mkdiv("").append(
                $mkel("label",{"for":"password"},null,"Password:"),
                $mkel("input",
                      {"type":"password","name":"password","id":"password"},
                      null,
                      "Password:"
                )
            ),
            $mkpush_button("subbox","","Submit",submit)
        )
    );
    body.appendChild(login.el);
}

function checklogin(form) {
    xhr=mkxhr();
    //for now...
    var loginfo = {uname:byid("username").value,passwd:byid("password").value};
    xhr.onreadystatechange = function() {
	    if (xhr.readyState===4) {
	        if (xhr.status===200) {
		        console.log("success");
	        }
	        else if (xhr.status===403) {
		        console.log("fail");
		        loginfo=null;
	        }
	        $byid('login').rmclass("drop").addclass("away");
	        setTimeout(function(){initapp(loginfo);},1000);
	    }
    }
    xhr.open("post", form.action, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-from-urlencoded');
    try { xhr.send("username="+loginfo.uname+
		   "&password="+loginfo.passwd); }
    catch (e) {console.log("error caught in send: %o",e)}
}


function notify(message){
    document.body.appendChild(
        $mkdiv(
            "modalbg",["modal"]
        ).append(
            $mkdiv(
	            "diag",["modal-diag","drop"],message
            ).append(
                mkpush_button(
                    "modal-button", "", "ok",function(){
                        $byid("diag").rmclass("drop").rmel("away",500,function(){
                            $byid("modalbg").rmel();
                        });
                    }
                )
	            
            )
        ).el
    );

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
    prune(document.body);
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
		        mkpush_button("new", "", "New", function(){
		            make_child(app.el,'New Note', app, true);})
	        ).append(
		        mkpush_button("save", "", "Save",
			                  function(){save(app.el, loginfo);})
	        ),
	        $mkdiv(
		        "root-children","root-children"
	        )
	    ).evliss(
	        "mousemove", function(e){app.move(e);},
	        "mouseup", function(e){app.end_move(e);}
        );
	    /*then, we create the methods*/
	    app.start_move = function(e) {
	        this.possible = nodefor(e.target);
            console.log(this.possible);
            this.element_offset = {
                x:e.clientX - this.possible.offsetLeft,
                y:e.clientY - this.possible.offsetTop
            };
        }
	    const overlap = {notin:0, inbody:1, inhead:2, inall:3};
	    function insidebox(x, y, body, head) {
	        var ret=0;
	        if(y > body.top && y < body.bottom
                && x > body.left && x < body.right)
		        ret |= overlap.inbody;
	        if(y > head.top && y < head.bottom
                && x > head.left && x < head.right)
		        ret |= overlap.inhead;
	        return ret;
	    }
	    app.overarea = function(e) {
            var x = e.clientX, y=e.clientY;
	        var matches = this.visible.map(function(c){
		        return insidebox(x, y, c.body, c.head);
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
	        return {area:retarea, target:byid(over.id)};
	    };
	    app.overarea.bottom=0;
	    app.overarea.top=1;
	    app.overarea.insert=2;
	    app.overarea.invalid=3;
        
	    app.valid_target = function (obj){
            return !has(this.undropable, idof(obj));
	    };
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
			            return {
			                id : id,
			                body: c.getBoundingClientRect(),
			                head: byid(id+"-header").getBoundingClientRect()
			            };
		            });
		            
		        }
	        }
            var root = $byid("root");
            var offset = root.el.getBoundingClientRect();
            var padding = getComputedStyle(
                root.el,null
            ).getPropertyValue(
                "padding-top"
            ).replace("px","");
            padding = Number(padding);
            
	        var dr = {
                x: e.clientX - offset.left,
		        y: e.clientY - offset.top
            };
            
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
	    app.over_shift = function(el, inclusive) {
            var id=idof(el);
	        if (this.overstate === "shift") return;
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
        app.rmtemp = function(delay) {
            if (!delay) delay=300;
            byclass("temp").map(function(el) {
		        $(el).rmel("erase", delay);
		    });
        };
	    app.over_cleanup = function() {
	        //removing temp from shifting
	        if (this.overstate === "shift") {
		        this.rmtemp();
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
            console.log(this.overstate);
	        var current = this.movee.getBoundingClientRect();
	        var over = byid(this.current_over);
	        var newpos = over.getBoundingClientRect();
            this.rmtemp(1);
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
		        x:current.x-newpos.x,
		        y:current.y-newpos.y
	        });
	        var tmp = this.movee;
	        setTimeout(function(){
		        tmp.style.transform = "";
		        tmp.style.webkitTransform = "";
		        tmp.style.transition = "";
		        tmp.style.webkitTransition = "";
	        },100);
	        setTimeout(function(){
		        tmp.style="";
	        },100);
	        saver.up();
	        delete this.movee;
	        check_hide(this.oldcontext.parent);
            this.over_cleanup();
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
	    })(app, loginfo);
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
