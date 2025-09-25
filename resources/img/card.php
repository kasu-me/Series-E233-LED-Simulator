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

	//各種変数定義
	$overlayImageFiles=[];
	$paramIndex=0;
	$firstParamKey="";
	
	foreach ($_GET as $key => $value) {
		$imgNo="";
		$imgId=$key;
		if(($key!="shu"&&$key!="iki"&&$paramIndex==0) || $key=="shu"){
			$firstParamKey=$key;
			//新方式対応の変換(旧方式はキーをそのまま使うため変換しない)
			if($key=="shu"){
				$imgId=$value;
			}
			//大きい種別画像
			if(startsWith($imgId,"C")){
		 		$img2 = imagecreatefrompng("../led/ledtypeA000.png");
		 		// 合成する画像のサイズを取得
				$sx = imagesx($img2);
				$sy = imagesy($img2);
				imageLayerEffect($img, IMG_EFFECT_ALPHABLEND);// 合成する際、透過を考慮する
				imagecopyresized($img, $img2, 108, -99*((int)substr($imgId,1,3))+32, 0, 0, $sx, $sy,128,32); // 合成する
				imagedestroy($img2); // 破棄
				//大きい種別画像の場合はこれ以外を表示しないためbreak
				break;
			}
			//小さい種別画像
			else{
				if($imgId<28){
					$img2 = imagecreatefrompng("../led/ledtypeS000.png");
				}else{
		 			$img2 = imagecreatefrompng("../led/ledtypeS".str_pad(floor(($imgId-28)/29)+1,3,0,STR_PAD_LEFT).".png");
				}
		 		// 合成する画像のサイズを取得
				$sx = imagesx($img2);
				$sy = imagesy($img2);
				imageLayerEffect($img, IMG_EFFECT_ALPHABLEND);// 合成する際、透過を考慮する
				if($imgId<28){
					imagecopyresized($img, $img2, 109, 32, 51*$imgId, 0, 144, 96, 48, 32); // 合成する
				}else if($imgId<56){
					imagecopyresized($img, $img2, 109, 32, 51*($imgId-28), 0, 144, 96, 48, 32 ); // 合成する
				}else{
					imagecopyresized($img, $img2, 109, 32, 51*(($imgId-56)), 0, 144, 96, 48, 32 ); // 合成する
				}
				imagedestroy($img2); // 破棄
			}
		}else if(($key!="shu"&&$key!="iki"&&$paramIndex==1) || $key=="iki"){
			//2番目のパラメータがcolの場合は画像IDを最初のキーにする
			if(paramIndex==1 && startsWith($imgId,"col")){
				$imgId=$firstParamKey;
			}
			//新方式対応の変換(旧方式はキーをそのまま使うため変換しない)
			if($key=="iki"){
				$imgId=$value;
			}
	 		$img2 = imagecreatefrompng("../led/ledimgA".str_pad(floor($imgId/100),3,0,STR_PAD_LEFT).".png");
	 		// 合成する画像のサイズを取得
			$sx = imagesx($img2);
			$sy = imagesy($img2);
			imageLayerEffect($img, IMG_EFFECT_ALPHABLEND);// 合成する際、透過を考慮する
			imagecopyresized($img, $img2, 252, -99*($imgId%100)+32, 0, 0, $sx*3, $sy*3, $sx, $sy); // 合成する
			imagedestroy($img2); // 破棄
		}else if($imgId=="col"){
			//色の場合は後で処理するためここでは何もしない
		}
		$paramIndex++;
	}

	// 正面画像
	array_push($overlayImageFiles,"front_twitter.png");
	foreach($overlayImageFiles as $fileName){
 		$img2 = imagecreatefrompng($fileName); // 合成する画像を取り込む

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