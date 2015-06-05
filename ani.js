function pos(box) {
    if (typeof(box) === "string") {
	box = byid(box).getClientBoundingRect();
    } else if (box.constructor === Node) {
	box = box.getClientBoundingRect();
    }
    return {x:box.left,y:box.top};
}
function animed_append(el,target,delay){
    target=$toel(target);
    var before = pos(target);
    append(el,target);
    var after  = pos(target);
    var dx = {x:after.x-before.x, y:after.y-before.y};
    target.style = "transform: translateX("+dx.x+"px) translateY("+dx.y+"px);";
    if (!delay) delay = 0.2;
    setTimeout(function(){
	delete target.style;
    }, delay*1000);
}

function animh(el, h1, h2, time) {
    el = $(el);
    
    var style = el.style;
    if (style.maxHeight && style.webkitTransition) {
	    style.webkitTransform = "";
    } else {
	    el.style.transform = movestyle;
    if (transtime) {
	    movestyle=transtime+"s ease-in"


        if (el.style.webkitTransition)
	        el.style.webkitTransition = movestyle;
	    else
	        el.style.transition = movestyle;
    }

    
}
function scalex(el, f, time) {
    el = $(el);
    var oldwidth = el.el.clientWidth;
    var newwidth = el.el.clientWidth*pct;

    
}
