// anim(el,
//   {prop:{from:..,to:...,easer:...},..}, {time:...,steps:...,easer:...}, donef)
function _anim(el, anims, timing, donef){
    el = $toel(el);
    var [time, steps] = timing ?
                        [timing.time, timing.steps] :
                        [false,false];
    !steps && (steps=40);
    !time  && (time=1000);
    if (!timing || !timing.easer)
        timing.easer = (x)=>x;
    //making the animation calls
    anims = Object.keys(anims).map(function(prop){
        var [to,from] = [anims[prop].to,anims[prop].from];
        var easer = anims[prop].easer || null;
        if (!from) {
            from = window.getComputedStyle(el).getPropertyValue(prop);
        }
        var unit = to.match(
            /[+-]?(?:\d*\.\d+|\d+\.?\d*)(?:e[+-]?\d+)?(.*)/
        );
        unit = Array.isArray(unit) ? unit[1] : "";
        [to,from] = [parseInt(to),parseInt(from)];
        var d = to-from;
        if (easer)
            return function(x){
                el.style[prop] = (d*easer(x) + from)+unit;
            };
        else
            return function(x){
                el.style[prop] = (d*x + from)+unit;
            };
    });
    //setting up callback
    var start = Date.now(),
        end   = start + time;
    var interval = setInterval(function(){
        if (Date.now() > end) {
            anims.forEach((f)=>f(1));
            clearInterval(interval);
            donef && donef(el);
        } else {
            var dx = (Date.now()-start)/time;
            dx = timing.easer(dx);
            anims.forEach((f)=>f(dx));            
        }
    },time/steps);
}
var ani = {
    animate:_anim
};
