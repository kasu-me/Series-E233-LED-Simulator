<?php
	header("Content-Type: image/png");

	function startsWith($haystack, $needle) {
    return (strpos($haystack, $needle) === 0);
	}

	$img = imagecreatetruecolor(600, 314);

	// 背景を黒にする
	imagefill($img, 0,0, imagecolorallocate($img, 68, 68, 68));
	//ブレンドモードを無効にする
	imagealphablending($img, false);
	//完全なアルファチャネル情報を保存するフラグをonにする
	imagesavealpha($img, true);
	$imgFns=[];
	$i=0;
	$f="";
	foreach ($_GET as $key => $value) {
		$imgNo="";
		$id=$key;
		if(($key!="shu"&&$key!="iki"&&$i==0) || $key=="shu"){
			$f=$key;
			if($key=="shu"){
				$id=$value;
			}
			if(startsWith($id,"C")){
		 		$img2 = imagecreatefrompng("../led/ledtypeA000.png");
		 		// 合成する画像のサイズを取得
				$sx = imagesx($img2);
				$sy = imagesy($img2);
				imageLayerEffect($img, IMG_EFFECT_ALPHABLEND);// 合成する際、透過を考慮する
				imagecopyresized($img, $img2, 108, -99*((int)substr($id,1,3))+32, 0, 0, $sx, $sy,128,32); // 合成する
				imagedestroy($img2); // 破棄
				break;
			}else{
				if($id<28){
					$img2 = imagecreatefrompng("../led/ledtypeS000.png");
				}else{
		 			$img2 = imagecreatefrompng("../led/ledtypeS".str_pad(floor(($id-28)/29)+1,3,0,STR_PAD_LEFT).".png");
				}
		 		// 合成する画像のサイズを取得
				$sx = imagesx($img2);
				$sy = imagesy($img2);
				imageLayerEffect($img, IMG_EFFECT_ALPHABLEND);// 合成する際、透過を考慮する
				if($id<28){
					imagecopyresized($img, $img2, 109, 32, 51*$id, 0, 144, 96, 48, 32); // 合成する
				}else if($id<56){
					imagecopyresized($img, $img2, 109, 32, 51*($id-28), 0, 144, 96, 48, 32 ); // 合成する
				}else{
					imagecopyresized($img, $img2, 109, 32, 51*(($id-56)), 0, 144, 96, 48, 32 ); // 合成する
				}
				imagedestroy($img2); // 破棄
			}
		}else if(($key!="shu"&&$key!="iki"&&$i==1) || $key=="iki"){
			if(startsWith($id,"col")){
				$id=$f;
			}
			if($key=="iki"){
				$id=$value;
			}
	 		$img2 = imagecreatefrompng("../led/ledimgA".str_pad(floor($id/100),3,0,STR_PAD_LEFT).".png");
	 		// 合成する画像のサイズを取得
			$sx = imagesx($img2);
			$sy = imagesy($img2);
			imageLayerEffect($img, IMG_EFFECT_ALPHABLEND);// 合成する際、透過を考慮する
			imagecopyresized($img, $img2, 252, -99*($id%100)+32, 0, 0, $sx*3, $sy*3, $sx, $sy); // 合成する
			imagedestroy($img2); // 破棄
		}else if($id=="col"){
		}
		$i++;
	}

	// 正面画像
	array_push($imgFns,"front_twitter.png");
	foreach($imgFns as $fn){
 		$img2 = imagecreatefrompng($fn); // 合成する画像を取り込む

 		// 合成する画像のサイズを取得
		$sx = imagesx($img2);
		$sy = imagesy($img2);

		imageLayerEffect($img, IMG_EFFECT_ALPHABLEND);// 合成する際、透過を考慮する
		imagecopy($img, $img2, 0, 0, 0, 0, $sx, $sy); // 合成する

		imagedestroy($img2); // 破棄
	}

	//色
	if(isset($_GET["col"])){
		ImageFilledRectangle ($img, 0,21,51,132,imagecolorallocate($img, hexdec(substr($_GET["col"], 0, 2)), hexdec(substr($_GET["col"], 2, 2)), hexdec(substr($_GET["col"], 4, 2))) );
		ImageFilledRectangle ($img, 549,21,600,132,imagecolorallocate($img, hexdec(substr($_GET["col"], 0, 2)), hexdec(substr($_GET["col"], 2, 2)), hexdec(substr($_GET["col"], 4, 2))) );
	}

	imagepng($img);
	imagedestroy($img);

 ?>