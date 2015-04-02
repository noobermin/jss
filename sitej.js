function $mklink(id,text,url) {
    if (url) {
	return $mkel(
	    "a",{id:id, href:url},
	    "link",text);
    }
    return $mkel(
	"a",{id:id},
	"link",text
    );
}

function init() {
    console.log("started");
    $byid("hr").rmclass("hidden");
    $byid("sidenav").rmclass("shown");
    $byid("content").rmclass("shown");
    var nav = $byid("nav");
    nav.prune().append(
	$mklink("me","me."),
	$mklink("work","work."),
	$mklink("words","words.")
    ).addtempclass(
	"newlink",300
    ).evlis(
	"click", function(e) {
	    var id = idof(e.target);
	    if (id !== "me" && id !== "work" &&  id !== "words") return;
	    nav.addtempclass("transitout",200);
	    setTimeout(function() {
		nav.prune();
		if (id == "me") {
		    nav.append(
			$mkel("p",{id:"pp"}).append(
			    $mklink(
				"1","1/","http://github.com/noobermin"
			    ),
			    $mklink(
				"2","2/","http://instagram.com/windywalk"
			    ),
			    $mklink(
				"3","3/","http://twitter.com/oneno_one"
			    )
			)
		    )
		} else if (id == "work") {
		    nav.inner("You expect something here?");
		} else if (id == "words") {
		    $byid("sidenav").addclass("shown");
		    $byid("hr").addclass("hidden");
		}
		nav.addtempclass("newlink",1000);
	    },200);
	}
    );
    //hack to the max
    var waiter = {
	setTimeout
    };
}
function loadwords(url) {
    var xhr = mkxhr();
    xhr.onreadystatechange = function() {
	console.log("got response");
	if(xhr.readyState === 4 && xhr.status === 200)
	    writecontent(xhr.responseText);
    };
    xhr.open("GET",url,true);
    xhr.send();
}
function writecontent(text) {
    var content = $byid("content");
    content.inner(text);
    var els = content.el.getElementsByClassName("img-sq");
    console.log(els);
    var Img = new Image();
    var imgs = [];
    /*scroll-over showing*/
    map(els,function(c){
    });
    content.addclass("shown");
}

function imageshower(){}
