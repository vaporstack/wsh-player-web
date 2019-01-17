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

			obj.lines[i].points_x[j] += wbigger ;
			obj.lines[i].points_y[j] += wbigger;


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

function render_line(c, line)
{
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

function init()
{
	setup_refresh();
	var headline = $("#infotext")[0];
	//console.log(headline);
	//var v = headline.val();
	//console.log(v);
	headline.innerText="Loading";
	//console.log("hello");
	var c = $("#player");


	//console.log(c);
	var text = readTextFile("data/test.wash");
	var json = JSON.parse(text);
	headline.innerText="done";
	headline.remove();

	var data = json.data;
	var meta = json.meta;
	info = $("#info");
	info.html("drawing: " + meta.info.path);
	//console.log(meta);

	var seq = data.sequence;
	var frames = seq.frames;
	var first = frames[0];
	var nf = normalize_frame(first);
	var lines = nf.lines;

	var c = window.ctx;
	// console.log(lines.length);
	// console.log(first);
	// console.log(data);
	console.log("Beginning drawing. ");
	for ( var i = 0 , n = lines.length; i< n; i++)
	{
		//console.log("Drawing line " + i);
		var l = lines[i];
		render_line(c, l);
	}


}

function setup_refresh()
{
	var htmlCanvas = document.getElementById('player'),

    	context = htmlCanvas.getContext('2d');
	initialize();
	window.ctx = context;
	function initialize() {
		window.addEventListener('resize', resizeCanvas, false);
		resizeCanvas();
	}

	function redraw() {
	context.strokeStyle = 'black';
		context.lineWidth = '1';
		context.strokeRect(0, 0, window.innerWidth, window.innerHeight);
	}

	function resizeCanvas() {
		htmlCanvas.width = window.innerWidth;
		htmlCanvas.height = window.innerHeight;
		redraw();
}
};
