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

	define("MAKU_COUNT_PER_IMAGE_IKISAKI", 100);
	define("MAKU_COUNT_PER_IMAGE_SHUBETSU_SMALL", 28);
	define("MAKU_COUNT_PER_IMAGE_SHUBETSU_LARGE", 100);

	foreach ($_GET as $key => $value) {
		$imgId=$key;
		if(($key!="shu"&&$key!="iki"&&$paramIndex==0) || $key=="shu"){
			$firstParamKey=$key;
			//新方式対応の変換(旧方式はキーをそのまま使うため変換しない)
			if($key=="shu"){
				$imgId=$value;
			}
			//大きい種別画像
			if(startsWith($imgId,"C")){
				$bigShubetsuImg = imagecreatefrompng("../led/ledtypeA000.png");
				// 合成する画像のサイズを取得
				$imgWidth = imagesx($bigShubetsuImg);
				$imgHeight = imagesy($bigShubetsuImg);
				imageLayerEffect($img, IMG_EFFECT_ALPHABLEND);// 合成する際、透過を考慮する
				imagecopyresized($img, $bigShubetsuImg, 109, -99*((int)substr($imgId,1,3))+32, 0, 0, $imgWidth*3, $imgHeight*3, $imgWidth, $imgHeight); // 合成する
				imagedestroy($bigShubetsuImg); // 破棄
				//大きい種別画像の場合はこれ以外を表示しないためbreak
				break;
			}
			//小さい種別画像
			else{
				$smallShubetsuImg = imagecreatefrompng("../led/ledtypeS".str_pad(floor($imgId/MAKU_COUNT_PER_IMAGE_SHUBETSU_SMALL),3,0,STR_PAD_LEFT).".png");
				// 合成する画像のサイズを取得
				$imgWidth = imagesx($smallShubetsuImg);
				$imgHeight = imagesy($smallShubetsuImg);
				imageLayerEffect($img, IMG_EFFECT_ALPHABLEND);// 合成する際、透過を考慮する
				imagecopyresized($img, $smallShubetsuImg, 109, 32, 51*($imgId%MAKU_COUNT_PER_IMAGE_SHUBETSU_SMALL), 0, 144, 96, 48, 32); // 合成する
				imagedestroy($smallShubetsuImg); // 破棄
			}
		}else if(($key!="shu"&&$key!="iki"&&$paramIndex==1) || $key=="iki"){
			//2番目のパラメータがcolの場合は画像IDを最初のキーにする
			if($paramIndex==1 && startsWith($imgId,"col")){
				$imgId=$firstParamKey;
			}
			//新方式対応の変換(旧方式はキーをそのまま使うため変換しない)
			if($key=="iki"){
				$imgId=$value;
			}
			$ikisakiImg = imagecreatefrompng("../led/ledimgA".str_pad(floor($imgId/MAKU_COUNT_PER_IMAGE_IKISAKI),3,0,STR_PAD_LEFT).".png");
			// 合成する画像のサイズを取得
			$imgWidth = imagesx($ikisakiImg);
			$imgHeight = imagesy($ikisakiImg);
			imageLayerEffect($img, IMG_EFFECT_ALPHABLEND);// 合成する際、透過を考慮する
			imagecopyresized($img, $ikisakiImg, 252, -99*($imgId%MAKU_COUNT_PER_IMAGE_IKISAKI)+32, 0, 0, $imgWidth*3, $imgHeight*3, $imgWidth, $imgHeight); // 合成する
			imagedestroy($ikisakiImg); // 破棄
		}else if($imgId=="col"){
			//色の場合は後で処理するためここでは何もしない
		}
		$paramIndex++;
	}

	// 正面画像
	array_push($overlayImageFiles,"front_twitter.png");
	foreach($overlayImageFiles as $fileName){
		$overlayImg = imagecreatefrompng($fileName); // 合成する画像を取り込む

		// 合成する画像のサイズを取得
		$imgWidth = imagesx($overlayImg);
		$imgHeight = imagesy($overlayImg);

		imageLayerEffect($img, IMG_EFFECT_ALPHABLEND);// 合成する際、透過を考慮する
		imagecopy($img, $overlayImg, 0, 0, 0, 0, $imgWidth, $imgHeight); // 合成する

		imagedestroy($overlayImg); // 破棄
	}

	//色
	if(isset($_GET["col"])){
		ImageFilledRectangle ($img, 0,21,51,132,imagecolorallocate($img, hexdec(substr($_GET["col"], 0, 2)), hexdec(substr($_GET["col"], 2, 2)), hexdec(substr($_GET["col"], 4, 2))) );
		ImageFilledRectangle ($img, 549,21,600,132,imagecolorallocate($img, hexdec(substr($_GET["col"], 0, 2)), hexdec(substr($_GET["col"], 2, 2)), hexdec(substr($_GET["col"], 4, 2))) );
	}

	imagepng($img);
	imagedestroy($img);

 ?>