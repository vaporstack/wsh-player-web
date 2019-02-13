<!DOCTYPE html>
<html class="h-100" lang="en">
	<head>
	<title>
		player
	</title>

	<script src="js/wsh_frame_ops.js"></script>
	<script src="js/io.js"></script>
	<script src="js/player.js"></script>
	<!--script src="js/p5.min.js"></script-->
	<script src="js/jquery.min.js"></script>

  <link href="/favicon.ico" rel="icon" type="image/x-icon"/>
  <link href="css/tachyons.min.css" rel="stylesheet"/>
  <!--link href="/css/normalize.css" rel="stylesheet"/-->
  <link href="css/style.css" rel="stylesheet"/>

 </head>
<body class="h-100" onload="init();">
<div id="outer" >
<h1 id="infotext" class="sans-serif f-headline-l">hello</h1>
<canvas id="player" width="256" height="256">
	Sorry, <strong>CANVAS</strong> is not supported by your browser.
</canvas>
<div id="infowrap" class="pv5 h">
<div id="info">

</div>
<output id="list"></output>
<div id="controls">

these don't work yet:
<button class=""
        type="button">
        restart
</button>
<button class=""
        type="button">
        random
</button>
<div id="drop_zone">drop zone</div>

<form>
	<select id="wash_picker">
  <?php

if ($handle = opendir('data/')) {
    //echo "Directory handle: $handle\n";
    //echo "Entries:\n";

    /* This is the correct way to loop over the directory. */
    while (false !== ($entry = readdir($handle))) {
        echo "<option value='$entry'>$entry</option> \n";
    }

    /* This is the WRONG way to loop over the directory. */
    //while ($entry = readdir($handle)) {
    //   echo "$entry\n";
    //}

    closedir($handle);
}
?>

</select>
	<input type="checkbox" onclick="toggle_skip()" name="skip" value="skip" id="skip">
	<label for="skip">pretend a hand can teleport instantly, and there is zero looking performed, to speed things up</label>
</form></div>
</div>
</div>

<div id="cursor"><</div>
</body>
</html>
