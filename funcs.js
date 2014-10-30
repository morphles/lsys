function e(id) {
	return document.getElementById(id);
}

var dummy_ctx = {
	minx:0, maxx:0, miny:0, maxy:0,
	reset:function() {
		this.minx = this.miny = this.maxx = this.maxy = 0;
	},
	moveTo:function (x, y) {
		this.minx = this.minx > x ? x : this.minx;
		this.miny = this.miny > y ? y : this.miny;
		this.maxx = this.maxx < x ? x : this.maxx;
		this.maxy = this.maxy < y ? y : this.maxy;
	},
	lineTo:function(x, y) { this.moveTo(x, y); },
	fillRect:function (x, y, w, h) {
		this.minx = this.minx > x ? x : this.minx;
		this.miny = this.miny > y ? y : this.miny;
		this.maxx = this.maxx < (x + w) ? (x + w) : this.maxx;
		this.maxy = this.maxy < (y + h) ? (y + h) : this.maxy;
	},
	beginPath:function() {},
	stroke:function() {},
};

function createOffscreenCanvas(w, h){
	var c = document.createElement('canvas');
	c.width = w;
	c.height = h;
	return c;
}

var funcs = {
	stack:[],
	fwd:function (ctx, s) {
		funcs.rep = funcs.fwd;
		var nx = s.x + Math.cos(s.a) * s.l;
		var ny = s.y + Math.sin(s.a) * s.l;
		ctx.moveTo(s.x + 0.5, s.y + 0.5);//+0.5 cause web is mega retarded again!
		ctx.lineTo(nx + 0.5, ny + 0.5);
		s.x = nx;
		s.y = ny;
		return s;
	},
	tl:function (ctx, s) {
		funcs.rep = funcs.tl;
		s.a -= s.da;
		return s;
	},
	tr:function (ctx, s) {
		funcs.rep = funcs.tr;
		s.a += s.da;
		return s;
	},
	push:function (ctx, s) {//XXX push/pop rep!
		funcs.stack.push(JSON.parse(JSON.stringify(s)));
		return s;
	},
	pop:function (ctx, s) {
		item = funcs.stack.pop();
		return (typeof item != undefined) > 0 ? item : s;
	},
	point:function (ctx, s) {
		ctx.fillRect(s.x, s.y, 1, 1);
		return s;
	},
	rect:function (ctx, s) {
		ctx.fillRect(s.x, s.y, s.l, s.l);
		return s;
	},
	mu:function (ctx, s) {
		funcs.rep = funcs.mu;
		s.y -= +s.l;
		return s;
	},
	md:function (ctx, s) {
		funcs.rep = funcs.md;
		s.y += +s.l;
		return s;
	},
	mr:function (ctx, s) {
		funcs.rep = funcs.mr;
		s.x += +s.l;
		return s;
	},
	ml:function (ctx, s) {
		funcs.rep = funcs.ml;
		s.x -= +s.l;
		return s;
	},
	rep:function (ctx, s) {
		return s;//dummy declared to appear in help
	},
};

var func_help = {
	fwd:'Move forward by &quot;Length&quot; drawing a line',
	tl:'Turn left by &quot;Angle&quot;',
	tr:'Turn right by &quot;Angle&quot;',
	push:'Push all parameters into stack',
	pop:'Pop all parameters from the stack',
	point:'Draw a single point at current position',
	rect:'Draw square at current position with side of &quot;lenght&quot;',
	mu:'Move upwards by lenght, without drawing',
	md:'Move downwards by lenght, without drawing',
	mr:'Move right by lenght, without drawing',
	ml:'Move left by lenght, without drawing',
	rep:'Repeat last command, only considers commands that affect position/angle: fwd, tl, tr, mu, md, mr, ml',
};

function ran(a) {
	var i, r = Math.random();
	for (i = 0; (r > 0) && (i < a.length); r -= a[i++]);
	return i - 1;
}

function spinner (ev) {
	var magnitude = Math.abs(ev.target.value) < 1 ? 0.1 : 1
	ev.target.value = ((+ev.target.value) + (ev.deltaY > 0 ? -1 : 1) * magnitude).toFixed(1);
	ev.preventDefault();
}

function evolve_string(s, rules, iterations) {
	var ns, p, i, j, idx;
	for (i = 0; i < iterations; i++) {
		ns = '';
		for (j = 0; j < s.length; j++) {
			p = rules[s[j]];
			ns = ns + (p ? p['rs'][ran(p['ps'])] : s[j]);
		}
		s = ns;
	}
	return s;
}

function parse_rules(rstring) {
	var lhs, rhs, chr, prob, rs = {}, arr, tmp;

	rstring.split("\n").forEach(function (e) {
		tmp = e.split("=");
		lhs = tmp[0]; rhs = tmp[1];
		tmp = lhs.split(".");
		chr = tmp[0]; prob = tmp[1];
		if (typeof rs[chr] == 'undefined') {
			rs[chr] = {'ps':[], 'rs':[]};//probabilities, replacements
		}
		rs[chr]['ps'].push(prob ? +("0." + prob) : 1);//XXX add validation of probability definitions and sum, add implicit filling with identity if probabilities do not add up to 1 XXX
		rs[chr]['rs'].push(rhs);
	});

	return rs;
}

function parse_funcs(fstring) {
	var parts, assocc = {};
	fstring.split("\n").forEach(function (e) {
		parts = e.split("=");
		if (typeof assocc[parts[0]] == 'undefined') {
			assocc[parts[0]] = [];
		}
		assocc[parts[0]].push(parts[1]);
	});
	return assocc;
}

function get_json() {
	alert(JSON.stringify({
		'seed':e('seed').value, 'rules':e('rules').value, 'func':e('func').value,
		'iter':e('iter').value, 'len':e('len').value, 'deg':e('deg').value, 'alpha':e('alpha').value,
	}));
}

function set_json(d) {
	if (!d) return;
	d = JSON.parse(d);
	for (k in fields = ['seed', 'rules', 'func', 'iter', 'len', 'deg', 'alpha']) {
		e(fields[k]).value = d[fields[k]];
	}
}
