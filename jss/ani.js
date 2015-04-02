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
