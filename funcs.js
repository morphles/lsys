var funcs = {
	fwd:function (x, y, a, l, ctx, da, dl) {
		funcs.rep = funcs.fwd;
		var nx = x + Math.cos(a) * l;
		var ny = y + Math.sin(a) * l;
		console.log(nx, ny);
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
		//funcs.rep = funcs.push;
		stack.push([x, y, ca, l]);
		return [x, y, a, l];
	},

	pop:function (x, y, a, l, ctx, da, dl) {
		item = stack.pop();
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
