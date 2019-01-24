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

/*

function normalize_frame_time(obj)
{
	var first = Number.POSITIVE_INFINITY;
	for ( var i = 0, n = obj.lines.length; i < n; i++ )
	{
		var l = obj.lines[i];
		for ( var j = 0, n2 = l.time.length; j < n2; j++ )
		{
			var t = l.time[j];
			if ( t < first )
			{
				first = t;
			}
		}
	}
	console.log(first);
	for ( var i = 0, n = obj.lines.length; i < n; i++ )
		for ( var j = 0, n2 = obj.lines[i].time.length; j < n2; j++ )
			obj.lines[i].time[j] -= first;

	return obj;
}

function normalize_frame(obj)
{
	var bounds = get_bounds(obj);
	var minx = bounds[0];
	var miny = bounds[1];
	var maxx = bounds[2];
	var maxy = bounds[3];
	console.log(minx, miny, maxx, maxy);
	console.log(obj)

	var dx = maxx - minx;
	var dy = maxy - miny;
	var bigger = (dx > dy ) ? dx : dy;
	var w = window.innerWidth;
	var h = window.innerHeight;
	console.log("normalizing by " + bigger);
	var wbigger = ( w > h ) ? w : h;
	console.log("scaling to " + wbigger);
	var scale = wbigger * .75;

	var shift = wbigger * .5;
	//	shift the data to be 0-1 positive and shrink it

	for ( var i = 0; i < obj.lines.length; i++ )
	{
		for ( var j = 0; j < obj.lines[i].points_x.length; j++)
		{
			//obj.lines[i].points_x[j] -= minx;
			//obj.lines[i].points_y[j] = miny;

			//	cut it to 0-1
			obj.lines[i].points_x[j] /= bigger;
			obj.lines[i].points_y[j] /= bigger;

			// //	scale it to window size
			obj.lines[i].points_x[j] *= scale;
			obj.lines[i].points_y[j] *= scale;

			obj.lines[i].points_x[j] += w * .5 ;
			obj.lines[i].points_y[j] -= h * .5;


		}
	}


	var bounds = get_bounds(obj);
	var minx = bounds[0];
	var miny = bounds[1];
	var maxx = bounds[2];
	var maxy = bounds[3];
	console.log(minx + "/" +  miny + " " + maxx + "/"+ maxy);


	//then, scale it to something nice relative to the window size
	return obj;
}
*/

function zip_line(data)
{
	var res = [];
	for ( var i=0,n = data.points_x.length; i < n ; i++ )
	{
		var p = {
			x : data.points_x[i],
			y : data.points_y[i] * -1,
			p : data.pressure[i]
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
	return { x : -1, y : -1, p : -1 };
}

function render_brush(line, pos)
{
	var ctx = window.ctx;
	var l = zip_line(line)
	var first = l[0];

	var width = 10;

	if ( pos === undefined )
		pos = l.length-1;

	if ( pos > l.length - 1 )
	{
		console.log("ack tried to draw more than we have");
		pos = l.length - 1;
	}

	var left = [];
	var right = [];
	for ( var i = 1, n = pos; i<n; i++ )
	{
		var a = l[i-1];
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

	right.push(l[pos]);

	var stroke = left.slice();
	for ( var i = right.length-1; i > 0; i--)
	{
		stroke.push(right[i]);

	}

	if(stroke.length == 0)
	{
		console.log("NO points!\n");
		return;
	}

	//console.log("Created stroke with " + stroke.length + " points");

	var first = stroke[0];
	var px, py;
	px = first.x;
	py = first.y;
	ctx.beginPath();
	ctx.moveTo(px, py);

	for ( var i = 0 ; i < stroke.length; i++ )
	{
		var p = stroke[i];
		ctx.lineTo(p.x, p.y);
		px = p.x;
		py = p.y;
	}

	ctx.fillStyle = "rgba(0, 9, 0, 0.125)";;

	ctx.fill();

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
	clear();
	setup_drawdata();
	start_drawing();
	//return;
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


	var now = new Date().getTime() / 1000;
	var delta = now - state['drawing_start'];
	var aaa = state;
	if ( !state.line || state.cursor >= state.line.points_x.length )
	{
		console.log("next line");
		state.line = state.working.lines.shift();
		state.cursor = 0;
	}else{
		state.cursor++;
	}

	if ( state.cursor < state.line.points_x.length)
		render_brush(state.line, state.cursor);


	//var next = state.working.lines.shift();

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
	ctx.fillStyle = "red";

	window.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
}

//takes a document
function setup_drawdata()
{
	var doc = load_wash("data/test.wash");

	//setup_drawdata(json);
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

function init()
{
	setup_refresh();

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
