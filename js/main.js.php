<?php
header("Content-Type: application/javascript; charset=UTF-8");
?>
import * as canvasUtil from "./canvas.js?var=<?php echo filemtime($_SERVER['DOCUMENT_ROOT'] . '/js/canvas.js'); ?>";
import * as uiUtil from "./ui.js?var=<?php echo filemtime($_SERVER['DOCUMENT_ROOT'] . '/js/ui.js'); ?>";

<?php
	echo file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/e233/js/main.js');
?>