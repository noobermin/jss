var ani=(function(){
    // anim(el,
    //   {prop:{from:..,to:...,easer:...},..}, {time:...,steps:...,easer:...}, donef)
    function anim(el, anims, timing, donef){
        el = $toel(el);
        var time, step;
        if (timing) {
            time = timing.time;
            steps= timing.steps;
        }
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
    //successively call functions using with ms delays.
    //For functions f,g,h,
    //
    // succ(
    //   100, f,
    //   200, g,
    //   100, h);
    //
    // calls f after 100 ms, g 200 ms after the call to f, and h 100 ms after the call
    // to g, all approximately (of course, limited by speed of computation). This
    // roughtly approximates
    //
    // setTimeout(function(){
    //     f();
    //     setTimeout(function(){
    //         g();
    //         setTimeout(h,100);
    //     },200);
    // },100);
    function succ(){
        var as = array.slice(arguments);
        function recaller(i){
            if(i + 1 < as.length)
                setTimeout(function(){
                    as[i+1]();
                    recaller(i+2);
                },as[i]);
        }
        recaller(0);
    }

    return {animate:anim,succ:succ};
})();

