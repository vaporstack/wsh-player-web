
function wsh_frame_ops_normalize_wobject_time(obj)
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

	obj.normalized_time = true;
	return obj;
}

function wsh_frame_ops_normalize_wobject(obj)
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
	obj.normalized_scale = true;
	return obj;
}
