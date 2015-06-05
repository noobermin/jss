var array = (function(){
    //my syntatic sugar (slow?)
    function mkarraycall(callname) {
        return Array.prototype[callname].call.bind(Array.prototype[callname]);
    }
    var concat = mkarraycall("concat"),
        slice = mkarraycall("slice");
    return {
        map:mkarraycall("map"),
        filter:mkarraycall("filter"),
        concat:concat,
        reduce:mkarraycall("reduce"),
        slice:slice,
        concatv:function(arraylike,lists) {
            return concat.apply(concat,concat([arraylike],lists));
        },
        //convience functions
        has: function(arraylike,ino){return filter(arraylike,function(c){return c == ino}).length > 0;},
        last:function(arraylike){ return arraylike[arraylike.length-1]; },
        setlast: function(arraylike,d){ arraylike[arraylike.length-1]=d; },
        findfirst: function(arraylike, func) {
            var arr = slice(arraylike);
            if (func.constructor !== Function) {
	            var val=func;
	            func = (function(c){return c==val;});
            }
            for(var i=0; i < arr.length; ++i)
	            if (func(arr[i])) return i;
            return -1;
        },
        arr: function (n,fill) {
            if (fill===undefined) fill=0;
            if (n===undefined) n=0;
            var arr = [];
            for(;n!=0;--n) arr.push(fill);
            return arr;
        },
        rnd: function(n,low,hi) {
            if (low===undefined) low =0;
            if (hi===undefined) hi =1;
            var t = low; low = Math.min(low,hi);
            hi = Math.max(t,hi);
            if (n == 1) return Math.random()*(hi - low) + low;
            return arr(n).map(function(c){
                return Math.random()*(hi - low) + low;
            });
        },
        rndint: function(n, low, hi){
            if (low===undefined) low =0;
            if (hi===undefined) hi =1;
            var t = low; low = Math.min(low,hi);
            hi = Math.max(t,hi);
            if (n == 1) return Math.floor(Math.random()*(hi - low)) + low;
            arr(n).map(function(c){
                return Math.floor(Math.random()*(hi - low)) + low;
            });
        },
        pairs: function(arr){
            return arr.map(function(c,i){
                return arr.slice(i+1).map(function(d){
                    return [c,d];
                });
            }).reduce(function(p,c){
                return p.concat(c);
            });
        },
        arange: function(start,end,step){
            !step && (step = 1);
            if(!end){
                end=start; start=0;
            }
            var n = (end-start)/step;
            if(n<0)return [];
            
            return arr(n).map(function(c,i){
                return i*step + start;
            });       
        }
    };
})();
//my "functional" redefinition of these functions
