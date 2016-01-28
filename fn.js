function importinto(ns, targetns) {
    if(!targetns) targetns = window;
    for(name in ns) {
        targetns[name]=ns[name];
    }
}

var array = (function(){
    function mkarraycall(callname){
        return Array.prototype[
            callname
        ].call.bind(Array.prototype[callname]);}
    var lib = {
        map:   mkarraycall("map"),
        filter:mkarraycall("filter"),
        concat:mkarraycall("concat"),
        reduce:mkarraycall("reduce"),
        slice: mkarraycall("slice"),
        concatv:function(arraylike,lists) {
            return concat.apply(concat,concat([arraylike],lists));
        },
        //convience functions
        has: function(arraylike,ino){
            return filter(
                arraylike,
                function(c){return c == ino}
            ).length > 0;},
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
            (!fill) && (fill=0);
            (!n)    && (n=0);
            var arr = [];
            for(;n!=0;--n) arr.push(fill);
            return arr;
        },
        rnd: function(n,low,hi) {
            (!low)  && (low=0);
            if (hi===undefined) hi =1;
            var t = low; low = Math.min(low,hi);
            hi = Math.max(t,hi);
            if (n == 1) return Math.random()*(hi - low) + low;
            return lib.arr(n).map(function(c){
                return Math.random()*(hi - low) + low;
            });
        },
        rndint: function(n, low, hi){
            if (low===undefined) low =0;
            if (hi===undefined) hi = 1;
            var t = low; low = Math.min(low,hi);
            hi = Math.max(t,hi);
            ++hi;
            if (n == 1) return Math.floor(Math.random()*(hi - low)) + low;
            return lib.arr(n).map(function(c){
                return Math.floor(Math.random()*(hi - low)) + low;
            });
        },
        zip: function(){
            var r=lib.slice(arguments);
            var l=r.reduce(function(p,c){
                //returns c.length if p is underfined.
                return p < c.length ? p : c.length;
            },r[0].length);
            return lib.arange(l).map(function(i){
                return r.map(function(d){
                   return d[i];
                });
            });
        },
        pairs: function(){
            var r=lib.slice(arguments);
            var v=[];
            for(var i=0; i < r.length; i+=2) 
                v.push([r[i],r[i+1]]);
            return v;
        },
        apairs: function(arr){
            return lib.pairs.apply(null,arr);
        },
        arange: function(start,end,step){
            !step && (step = 1);
            if(!end){
                end=start; start=0;
            }
            var n = Math.round((end-start)/step);
            if(n<0)return [];
            
            return lib.arr(n).map(function(c,i){
                return i*step + start;
            });       
        },
        eq:function(a,b){
            if (!a || !b || a.length !==b.length) return false;
            return a.reduce(function(p,c,i){
                return p && c === b[i]
            },true);
        }
    };
    return lib;
})();


var obj = (function(){
    var lib = {
        has:function(o){
            if(!o) return;
            return array.slice(arguments,1).map(function(c){
                return o[c] !== undefined;
            }).reduce(function(p,c){
                return p && c;
            },true);
        },
        //for reading out particular elements
        //of an object, meant for options sent to a function.
        //Only is really useful with es6 destructuring
        readout:function(o){
            if(!o) return;
            //obviously only works for a single depth
            return array.map(arguments,function(c){
                return o[c];
            });
        },
        cat:function(o,d){
            if(!o)return d;
            for (i in d){
                o[i] = d[i];
            }
            return o;
        },
        add:function(o,l,d){//I'm 26 this year, fitting.
            if(!o) return {l:d};
            o[l]=d;
            return o;
        },
        take:function(d){
            var o={};
            array.slice(arguments,1).forEach(function(c){
                if(d[c]) o[c] = d[c];
            });
            return o;
        },
        choice:function(o,l,e){
            return o && o[l] ? o[l] : e;
        }
    };
    return lib;
})();
var fn = {
    call:function(f){
        if (f && f.apply)
            return f.apply(null, array.slice(arguments, 1));
    },
    apply:function(f,a){
        if (f && f.apply)
            return f.apply(null, array.slice(a));
    },
    compose:function(){
        return array.slice(arguments).reduce(
            function(p,c){ return function(x){return c(p(x))}},
            function(x){return x;});
    },//why not?
    map: array.map
};

//accumulators
var acc = {
    max:function(){
        var val;
        return {
            acc:function(a){
                if (!val || a > val) val = a;
            },
            get:function(){return val;}
        };
    },
    min:function(){
        var val;
        return {
            acc:function(a){
                if (!val || a < val) val = a;
            },
            get:function(){return val;}
        };
    },
    sum:function(){
        var val=0;
        return {
            acc:function(a){
                val+=a;
            },
            get:function(){return val;}
        };
    }
};

if (typeof exports !== 'undefined') {
    obj.add(exports, "obj" obj);
    obj.add(exports, "array" array);
    obj.add(exports, "fn" fn);
};
