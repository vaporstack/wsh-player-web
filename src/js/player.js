var state = {};

function readTextFile(file)
{
	var rawFile = new XMLHttpRequest();
	rawFile.open("GET", file, false);
	var allText;
	rawFile.onreadystatechange = function()
	{
		if (rawFile.readyState === 4)
		{
			if (rawFile.status === 200 || rawFile.status == 0)
			{
				allText = rawFile.responseText;
				//alert(allText);
			}
		}
	}
	rawFile.send(null);
	return allText;
}

function get_bounds(obj)
{
	var minx, miny;
	var maxx, maxy;
	minx = miny = Number.POSITIVE_INFINITY;
	maxx = maxy = Number.NEGATIVE_INFINITY;

	var lines = obj.lines;
	for (var i = 0; i < lines.length; i++)
	{
		var l = lines[i];
		for (var j = 0; j < l.points_x.length; j++)
		{
			var x = l.points_x[j];
			var y = l.points_y[j];
			if (x < minx) minx = x;
			if (x > maxx) maxx = x;
			if (y < miny) miny = y;
			if (y > maxy) maxy = y;

		}
	}
	return [minx, miny, maxx, maxy];
}

function makeRequest(url)
{
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onreadystatechange = receiveResponse;
	xhr.send();
}

function receiveResponse(e)
{
	if (this.readyState == 4)
	{
		// xhr.readyState == 4, so we've received the complete server response
		if (this.status == 200)
		{
			// xhr.status == 200, so the response is good
			var response = this.responseXML;
			console.log(response);
		}
	}
}

function read_remote_wash_dir()
{
	console.log("HELLO");
	var url = "REDACTED";
	makeRequest(url);

}

function zip_line(data)
{
	var res = [];
	for (var i = 0, n = data.points_x.length; i < n; i++)
	{
		var p = {
			x: data.points_x[i],
			y: data.points_y[i] * -1,
			p: data.pressure[i],
			t: data.time[i]
		}
		res.push(p);
	}
	return res;
}

function angle_from_points(ax, ay, bx, by)
{
	return Math.atan2(by - ay, bx - ax);
}

function angle_from_points_p(a, b)
{
	return Math.atan2(b.y - a.y, b.x - a.x);
}

function mk_point()
{
	return {
		x: -1,
		y: -1,
		p: -1
	};
}



function render_brush(line, pos)
{
	var ctx = window.ctx;
	var l = zip_line(line)
	var first = l[0];

	var width = 10;

	if (pos === undefined)
		pos = l.length - 1;

	if (pos > l.length - 1)
	{
		//console.log("ack tried to draw more than we have");
		pos = l.length - 1;
	}

	var left = [];
	var right = [];
	for (var i = 1, n = pos; i < n; i++)
	{
		var a = l[i - 1];
		var b = l[i + 0];
		var c = l[i + 1];
		var ps = (a.p + b.p + c.p) / 3;
		var ang = angle_from_points_p(a, b);
		ang -= Math.PI * .5;

		var lp = mk_point();
		var rp = mk_point();

		lp.x = a.x + (Math.cos(ang) * ps * width);
		lp.y = a.y + (Math.sin(ang) * ps * width);

		ang += Math.PI;
		rp.x = a.x + (Math.cos(ang) * ps * width);
		rp.y = a.y + (Math.sin(ang) * ps * width);
		left.push(lp);
		right.push(rp);


	}

	var last = l[pos];
	var curs = document.getElementById('cursor');
	curs.style.left = last.x + "px";
	curs.style.top = last.y + "px";

	right.push(last);

	var stroke = left.slice();
	for (var i = right.length - 1; i > 0; i--)
	{
		stroke.push(right[i]);
	}

	if (stroke.length == 0)
	{
		console.log("NO points!\n");
		return;
	}

	var first = stroke[0];
	var px, py;
	px = first.x;
	py = first.y;
	ctx.beginPath();
	ctx.moveTo(px, py);

	for (var i = 0; i < stroke.length; i++)
	{
		var p = stroke[i];
		ctx.lineTo(p.x, p.y);
		px = p.x;
		py = p.y;
	}
	var col = line['stroke'];
	var r = col.r;
	var g = col.g;
	var b = col.b;
	var alpha = col.a;
	r *= 256;
	g *= 256;
	b *= 256;
	r = Math.floor(r)
	g = Math.floor(g)
	b = Math.floor(b)

	//ctx.stroke();
	//	quirk alert: fillStyle doesn't accept floats for rgb but it does for A? ok
	var str = "rgba(" + r + ", " + g + "," + b + ", " + .125 + ")";
	//console.log(str);
	//ctx.fillStyle = "rgba(255, 0, 0, 0.0125)";;
	//ctx.fillStyle = "rgba(255, 0, 0, 0.5)";;
	ctx.fillStyle = str;
	//ctx.strokeStyle = "black";
	ctx.fill();
}

function toggle_skip()
{
	state.skipping = !state.skipping;
	console.log(state.skipping);

}

function render_line(line)
{
	var c = window.ctx;
	var px, py;
	for (var i = 0, n = line.points_x.length; i < n; i++)
	{

		var x = line.points_x[i];
		var y = line.points_y[i] * -1;
		c.beginPath();
		c.moveTo(x, y);
		if (i > 0)
			c.lineTo(px, py);
		c.stroke();
		px = x;
		py = y;
	}
}

function restart()
{
	console.log("RESTART");
	do_finished_drawing();
	setup_drawdata();
	clear();
	start_drawing();
}

function do_finished_drawing()
{

	remove_interval();
	state.playing = false;
	console.log("DONE");
	//clear();
	//setup_drawdata();
	//start_drawing();
	//return;
}

function show_cursor()
{
	var element = document.getElementById('cursor');
	element.style.opacity = "0.9";
	element.style.filter = 'alpha(opacity=90)';
}

function hide_cursor()
{
	var element = document.getElementById('cursor');
	element.style.opacity = "0.1";
	element.style.filter = 'alpha(opacity=10)';
}

function draw_integrated()
{
	var now = new Date().getTime() / 1000;
	var delta = now - state['drawing_start'];
	var aaa = state;

	while (true)
	{
		if (state.working.lines.length == 0)
		{
			console.log("Donezo!\n");
			return;
		}

		/*
		var test = state.working.lines[0];
		var t = test.time[0];
		if ( t > delta )
		{
			//	we haven't yet reached the time do do the next one
			return;

		}
		*/


		if (!state.line)
		{
			if (!state.skipping)

			{
				test = state.working.lines[0];
				t = test.time[0];
				if (t > delta)
				{
					//	we haven't yet reached the time do do the next one
					hide_cursor();
					return;
				}
			}
			state.line = state.working.lines.shift();

			if (state.skipping)
			{
				var diff = state.line.time[0] - delta;
				for (var i = 0; i < state.line.time.length; i++)
				{
					state.line.time[i] -= diff;
				}
			}
		}



		var last_time = state.line.time[state.line.time.length - 1];
		if (last_time < delta)
		{
			show_cursor();
			render_brush(state.line);
			state.line = null;
			return;
		}
		else
		{
			var ind = 0;
			for (var i = 0; i < state.line.time.length; i++)
			{
				var t = state.line.time[i];
				if (t > delta)
					break;
				ind = i;
			}
			show_cursor();
			render_brush(state.line, ind);

			return;
		}

	}

	/*
	var lindex = 0;
	for ( var i = 0 ;i < state.working.lines.length; i++ )
	{
		var l = state.working.lines[i];
		var last = l.time[l.time.length-1];
		if ( last > delta )
		{
			lindex = i;
			break;
		}
		//console.log(last);
	}
	console.log(lindex);
	*/



}


function draw_continuously()
{
	//	this chunk is to draw the drawing with continuous (fake) time, adding a point on each frame

	//var aaa = state;
	if (!state.line || state.cursor >= state.line.points_x.length)
	{
		console.log("next line");
		state.line = state.working.lines.shift();
		state.cursor = 0;
	}
	else
	{
		state.cursor++;
	}

	//if ( state.cursor < state.line.points_x.length)
	render_brush(state.line, state.cursor);

}


function check_draw_content()
{
	if (!state.playing)
	{
		console.log("Shouldn't be here, not playing shouldn't be echecking!");
		return;
	}


	if (state.working.lines.length == 0)
	{
		do_finished_drawing();
		return;
	}

	//draw_continuously();
	draw_integrated();

}

function start_drawing()
{
	var d = new Date();
	state.cursor = 0;
	state['drawing_start'] = d.getTime() / 1000;
	state['playing'] = true;
	state['done'] = false;
	add_interval();

}

function remove_interval()
{
	clearInterval(state['draw_interval']);
}

function add_interval()
{
	state['draw_interval'] = setInterval(check_draw_content, 1000 / 60);
}

function load_wash(path)
{
	var text = readTextFile(path);
	return JSON.parse(text);

}

function clear()
{
	//ctx.fillStyle = "red";

	window.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
}

//takes a document


function setup_drawdata(path)
{
	var doc;
	if (!path)
	{
		doc = load_wash("data/test.wash");

	}else{
		doc = load_wash(path);
	}

	var ldata = doc.data;
	var lmeta = doc.meta;
	info = $("#info");
	info.html("drawing: " + lmeta.info.path);
	//console.log(meta);

	var seq = ldata.sequence;
	var frames = seq.frames;
	var first = frames[0];
	if (!first.normalized_scale)
		first = wsh_frame_ops_normalize_wobject(first);
	if (!first.normalized_time)
		first = wsh_frame_ops_normalize_wobject_time(first);

	state.document = doc;
	state.meta = lmeta;
	state.frame = first;
	state.working = first;

}

function on_wash_select(v)
{
	console.log("HIIII");
	console.log(v);
	setup_drawdata("data/" + v);

}

function init()
{

	read_remote_wash_dir();

	$('#wash_picker').change(function()
	{
		on_wash_select($(this).val());
	})
	$("#wash_picker").change = on_wash_select;
	setup_refresh();
	setup_drop();
	load_artwork();
	var headline = $("#infotext")[0];
	headline.innerText = "loading data...";

	var c = $("#player");

	var doc = load_wash("data/test.wash");
	var headline = $("#infotext")[0];
	state.document = doc;
	headline.innerText = "parsing data...";
	setup_drawdata();

	headline.innerText = "done";
	headline.remove();

	var loc = state;
	console.log("Ready. ");
	console.log("Frame has " + state.working.lines.length + " lines.");
	start_drawing();



}

function setup_refresh()
{
	var htmlCanvas = document.getElementById('player'),

		context = htmlCanvas.getContext('2d');
	context.scale(0.125, 0.025);
	initialize();
	window.ctx = context;

	function initialize()
	{
		window.addEventListener('resize', resizeCanvas, false);
		resizeCanvas();
	}

	function redraw()
	{
		context.strokeStyle = 'black';
		context.lineWidth = 1;
		context.strokeRect(0, 0, window.innerWidth, window.innerHeight);
	}

	function resizeCanvas()
	{
		htmlCanvas.width = window.innerWidth;
		htmlCanvas.height = window.innerHeight;
		redraw();
	}
};


function playpause()
{

	state['playing'] = !state['playing'];
	console.log(state['playing']);

	if (!state['playing'])
	{
		remove_interval();
	}
	else
	{
		add_interval();
	}
}

document.addEventListener('keydown', function(event)
{
	console.log(event.code);
	switch (event.code)
	{
		case "Space":
			playpause();
			break;
		case "KeyR":
			restart();
			break;
		case "KeyC":
			clear();
			break;

		default:
			console.log("Unhandled key: " + event.code);
			break;

	}
	// if (event.code == "Space" )
	// 	playpause();

	//   if (event.code == 'KeyZ' && (event.ctrlKey || event.metaKey)) {
	//     alert('Undo!')
	// }
});
