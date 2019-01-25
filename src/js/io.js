function load_artwork()
{
	// Check for the various File API support.
	if (window.File && window.FileReader && window.FileList && window.Blob)
	{
		// Great success! All the File APIs are supported.
	}
	else
	{
		alert('The File APIs are not fully supported in this browser.');
	}


	console.log("Loading files...");
}





function setup_drop()
{
	function handleFileSelect(evt)
	{
		evt.stopPropagation();
		evt.preventDefault();

		var files = evt.dataTransfer.files; // FileList object.

		// files is a FileList of File objects. List some properties.
		var output = [];
		for (var i = 0, f; f = files[i]; i++)
		{
			// Only process image files.
			// if (!f.type.match('image.*'))
			// {
			// 	continue;
			// }

			var reader = new FileReader();

			// Closure to capture the file information.
			reader.onload = (function(theFile)
			{
				return function(e)
				{
					clear();

					var doc = e.target.result;
					setup_drawdata(JSON.parse(doc));

					// // Render thumbnail.
					// var span = document.createElement('span');
					// span.innerHTML = ['<img class="thumb" src="', e.target.result,
					// 	'" title="', escape(theFile.name), '"/>'
					// ].join('');
					// document.getElementById('list').insertBefore(span, null);
				};
			})(f);

			// Read in the image file as a data URL.
			reader.readAsText(f);
			//reader.readAsDataURL(f);
		}

		// output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
		// 	f.size, ' bytes, last modified: ',
		// 	f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
		// 	'</li>');

	// document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
}

function handleDragOver(evt)
{
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

// Setup the dnd listeners.
var dropZone = document.getElementById('drop_zone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);

}
