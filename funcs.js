function e(id) {
	return document.getElementById(id);
}

var dummy_ctx = {
	minx:0, maxx:0, miny:0, maxy:0,
	reset:function() {
		[this.minx, this.miny, this.maxx, this.maxy] = [0, 0, 0, 0];
	},
	moveTo:function (x, y) {
		[this.minx, this.miny, this.maxx, this.maxy] = [this.minx > x ? x : this.minx, this.miny > y ? y : this.miny, this.maxx < x ? x : this.maxx, this.maxy < y ? y : this.maxy];
	},
	lineTo:function (x, y) {
		[this.minx, this.miny, this.maxx, this.maxy] = [this.minx > x ? x : this.minx, this.miny > y ? y : this.miny, this.maxx < x ? x : this.maxx, this.maxy < y ? y : this.maxy];
	},
	fillRect:function (x, y, w, h) {
		[this.minx, this.miny, this.maxx, this.maxy] = [this.minx > x ? x : this.minx, this.miny > y ? y : this.miny, this.maxx < (x + w) ? (x + w) : this.maxx, this.maxy < (y + h) ? (y + h) : this.maxy];
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
	fwd:function (x, y, a, l, ctx, da, dl) {
		funcs.rep = funcs.fwd;
		var nx = x + Math.cos(a) * l;
		var ny = y + Math.sin(a) * l;
		ctx.moveTo(x + 0.5, y + 0.5);//+0.5 cause web is mega retarded again!
		ctx.lineTo(nx + 0.5, ny + 0.5);
		return [nx, ny, a, l];
	},
	tl:function (x, y, a, l, ctx, da, dl) {
		funcs.rep = funcs.tl;
		return [x, y, a - da, l];
	},
	tr:function (x, y, a, l, ctx, da, dl) {
		funcs.rep = funcs.tr;
		return [x, y, a + da, l];
	},
	push:function (x, y, a, l, ctx, da, dl) {//XXX push/pop rep!
		funcs.stack.push([x, y, a, l]);
		return [x, y, a, l];
	},
	pop:function (x, y, a, l, ctx, da, dl) {
		item = funcs.stack.pop();
		return (typeof item != undefined) > 0 ? item : [x, y, a, l];
	},
	point:function (x, y, a, l, ctx, da, dl) {
		ctx.fillRect(x, y, 1, 1);
		return [x, y, a, l];
	},
	rect:function (x, y, a, l, ctx, da, dl) {
		ctx.fillRect(x, y, l, l);
		return [x, y, a, l];
	},
	mu:function (x, y, a, l, ctx, da, dl) {
		funcs.rep = funcs.mu;
		return [x, y - (+l), a, l];
	},
	md:function (x, y, a, l, ctx, da, dl) {
		funcs.rep = funcs.md;
		return [x, y + (+l), a, l];
	},
	mr:function (x, y, a, l, ctx, da, dl) {
		funcs.rep = funcs.mr;
		return [x + (+l), y, a, l];
	},
	ml:function (x, y, a, l, ctx, da, dl) {
		funcs.rep = funcs.ml;
		return [x - (+l), y, a, l];
	},
	rep:function (x, y, a, l, ctx, da, dl) {
		return [x, y, a, l];//dummy declared to appear in help
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
	var lhs, rhs, chr, prob, rs = {}, arr;

	rstring.split("\n").forEach(function (e) {//XXX mozilla specific multiple asignments follow XXX
		[lhs, rhs] = e.split("=");
		[chr, prob] = lhs.split(".");
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
