

var state = {};

function readTextFile(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    var allText;
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
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
	for ( var i = 0; i < lines.length; i++ )
	{
		var l = lines[i];
		for ( var j = 0; j < l.points_x.length; j++)
		{
			var x = l.points_x[j];
			var y = l.points_y[j];
			if ( x < minx ) minx = x;
			if ( x > maxx ) maxx = x;
			if ( y < miny ) miny = y;
			if ( y > maxy ) maxy = y;

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

function render_line( line)
{
	var c = window.ctx;
	var px, py;
	for ( var i = 0, n = line.points_x.length; i<n; i++ )
	{

		var x = line.points_x[i];
		var y = line.points_y[i] * -1;
		c.moveTo(x,y);
		if ( i > 0 )
		c.lineTo(px,py);
		c.stroke();
		px = x;
		py = y;
		// console.log(x,y);
	}
}

function finished_drawing()
{

	remove_interval();
	state.playing = false;
	console.log("DONE");
}

function check_draw_content()
{
	if ( !state.playing )
	{
		console.log("Shouldn't be here, not playing shouldn't be echecking!");
	}
	var now = new Date().getTime()/1000;
	var delta = now - state['drawing_start'];

	if ( state.working.lines.length == 0 )
	{
		finished_drawing();
		setup_drawdata(state.document);
		clear();
		start_drawing();
		return;
	}

	var next = state.working.lines.shift();
	//console.log(next);
	render_line(next);
	//console.log(delta);

	//console.log("yep");


	//console.log("checking draw content");
}

function start_drawing()
{
	var d = new Date();
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
	state['draw_interval'] = setInterval(check_draw_content, 1000/60);
}

function load_wash(path)
{
	var text = readTextFile(path);
	return  JSON.parse(text);

}

function clear()
{

	window.ctx.clearRect(0,0,256,256);
}

//takes a document
function setup_drawdata(doc)
{
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
	headline.innerText="loading data...";

	var c = $("#player");

	var doc = load_wash("data/test.wash");
	var headline = $("#infotext")[0];

	headline.innerText="parsing data...";
	setup_drawdata(doc);

	headline.innerText="done";
	//setTimeout(headline.remove, 1000);
	//sleep(1000);
	headline.remove();




	//var c = window.ctx;

	// console.log(lines.length);
	// console.log(first);
	// console.log(data);
	console.log("Ready. ");

	start_drawing();



}

function setup_refresh()
{
	var htmlCanvas = document.getElementById('player'),

    	context = htmlCanvas.getContext('2d');
	context.scale(0.125, 0.025);
	initialize();
	window.ctx = context;
	function initialize() {
		window.addEventListener('resize', resizeCanvas, false);
		resizeCanvas();
	}

	function redraw() {
	context.strokeStyle = 'black';
		context.lineWidth = '.25';
		context.strokeRect(0, 0, window.innerWidth, window.innerHeight);
	}

	function resizeCanvas() {
		htmlCanvas.width = window.innerWidth;
		htmlCanvas.height = window.innerHeight;
		redraw();
}
};


function playpause()
{

	state['playing'] = !state['playing'];
	console.log(state['playing']);

	if ( !state['playing'] )
	{
		remove_interval();
	}else{
		add_interval();
	}
}

document.addEventListener('keydown', function(event) {
console.log(event.code);
if (event.code == "Space" )
	playpause();

  if (event.code == 'KeyZ' && (event.ctrlKey || event.metaKey)) {
    alert('Undo!')
  }
});



