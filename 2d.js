//math specifically
var vmath = {
    norm:function(i){
        return Math.sqrt(i[0]*i[0]+i[1]*i[1]);
    },
    dot: function(a,b){
        return a[0]*b[0]+a[1]*b[1];
    },
    sqnorm: function(i){
        return vmath.dot(i,i);
    },
    add: function(a,b){
        return [a[0]+b[0], a[1]+b[1]];
    },
    addwith:function(a,b) {
        a[0]+=b[0]; a[1]+=b[1];
        return a;
    },
    sub: function(a,b){
        return [a[0]-b[0], a[1]-b[1]];
    },
    subwith:function(a,b) {
        a[0]-=b[0]; a[1]-=b[1];
        return a;
    },
    mul: function(a,b) {
        return [a[0]*b[0], a[1]*b[1]];
    },
    smul:function(a,r){
        return [r*a[0], r*a[1]];
    },
    div: function(a,b) {
        return [a[0]/b[0], a[1]/b[1]];
    },
    sdiv:function(a,r){
        return [a[0]/r, a[1]/r];
    },
    rot: function(a,th){
        var c = Math.cos(th), s = Math.sin(th);
        return [
            a[0]*c-a[1]*s,
            a[0]*s+a[1]*c
        ];
    },
    rotd: function(a,thd){
        return vmath.rot(a,thd/180*Math.PI);
    },
    cross: function(a,b) {
        return a[0]*b[1]-a[1]*b[0];
    },
    signed_area: function(a,b,c) {
        //this unrolled
        //return vmath.cross(a,b) + vmath.cross(b,c) + vmath.cross(c,a);
        return 0.5*(a[0]*(b[1]-c[1]) + b[0]*(c[1]-a[1]) + c[0]*(a[1]-b[1]));
    },
    signed_area_poly: function(points){
        return 0.5*_.zip(
            points.slice(),
            points.slice(1).concat([points[0]])
        ).reduce(
            function(p,c){
                return p + vmath.cross(c[0],c[1]);
            },0
        );
    },
    area_and_centroid: function (points){
        var f = vmath.signed_area_poly(points)*6.0;
        var ret = _.zip(
            points.slice(),
            points.slice(1).concat([points[0]])
        ).reduce(
            function(p,c){
                var factor = vmath.cross(c[0],c[1]);
                return [
                    p[0] + (c[0][0]+c[1][0])*factor,
                    p[1] + (c[0][1]+c[1][1])*factor
                ];
            },[0,0]
        );
        return {area:f/6.0, centroid:[ret[0]/f, ret[1]/f]};
    },
    centroid_poly: function(points){
        return vmath.area_and_centroid(points).centroid;
    },
    centroid: function(pts) {
        return pts.reduce(function(p,c){
            return [p[0]+c[0], p[1]+c[1]]
        },[0,0]).map(function(c){
            return c/pts.length;
        });
    },
    max_radius: function(pts,cen) {
        if (cen){
            pts = pts.map(function(c){
                return vmath.subwith(c,cen);
            });
        }
        return Math.sqrt(
            pts.map(vmath.sqnorm).reduce(function(p,c){
                return p > c ? p : c;
            },0)
        );
    },
    rotate_from:function(target,v){
        var n = vmath.norm(v);
        var c = v[0]/n,
            s = v[1]/n;
        return [
            target[0]*c-target[1]*s,
            target[0]*s+target[1]*c
        ];
    }
}
