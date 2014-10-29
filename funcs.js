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
	lineTo:this.moveTo,
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

function ran(a) {//maybe can be simplified; maybe using non cumulative probabilitis; though probably simpler with cumulative
	var i, j;
	var r = Math.random();
	for (i = 0, j = 0; (r > j) && (i < a.length); j = a[i], i++);
	return Math.max(i - 1, 0);
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
			idx = p ? ran(p['ps']) : 0;
			ns = ns + (p ? p['rs'][idx] : s[j]);
		}
		s = ns;
	}
	return s;
}

function parse_rules(rstring) {
	var lhs, rhs, chr, prob, rs = {}, arr, tmp;

	rstring.split("\n").forEach(function (e) {//XXX mozilla specific multiple asignments follow XXX
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

	for (chr in rs) {
		arr = rs[chr]['ps'].slice(0);
		//changes probabilities to cumulative, XXX might be a good place for above mentioned validation; Might not be needed if ran() could be reworked to work with non cumulative probabilities XXX
		rs[chr]['ps'] = arr.reduce(function (p, c, i) { p.push((i ? p[i - 1] : 0) + c); return p;}, []);
	}

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
