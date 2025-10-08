<?php
	// data.jsonのパス
	$dataFilePath = $_SERVER['DOCUMENT_ROOT'] . '/e233/resources/data.json';
	
	//クエリストリング処理
	$queryString = $_SERVER['QUERY_STRING'];

	//旧フォーマットのURLパラメータを新フォーマットにリダイレクト
	if (preg_match('/^[C\d]+&\d+&?/', $queryString)) {
		if(count($_GET)==3){
			$params = explode('&', $queryString);
			$newURL = '/?shu=' . $params[0] . '&iki=' . $params[1] . '&' . $params[2];
			header('Location: ' . $newURL, true, 301);
			exit();
		}
		//アニメーションURL
		else if(count($_GET)>3){
			$queryString= str_replace('&',',',$queryString);
			$queryString= str_replace(',col=','&col=',$queryString);
			$newURL = '/?cmd=animation&data=' . $queryString;
			header('Location: ' . $newURL, true, 301);
			exit();
		}
	}
?>
<!DOCTYPE html>
<html lang="ja">

<head>
	<link rel="icon" href="/e233/resources/img/favicon.png" sizes="192x192" />
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:site" content="@Omiya_Shinobu" />
	<meta property="og:url" content="<?php echo (empty($_SERVER['HTTPS']) ? 'http://' : 'https://') . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']; ?>" />
	<meta property="og:title" content="E233系LEDシミュレータ" />
	<meta property="og:description" content="ブラウザ上でE233系(一部小田急4000形と相鉄11000系と都営10-300形と都営5500形と東臨71-000形としなの鉄道SR1系)の行先表示器を再現することができるシミュレータ。" />
	<?php if ($queryString == "" ) : ?>
		<meta property="og:image" content="https://<?php echo $_SERVER["HTTP_HOST"] ?>/e233/resources/img/twtr.png" />
	<?php else : ?>
		<meta property="og:image" content="https://<?php echo $_SERVER["HTTP_HOST"] ?>/e233/resources/img/card.php?<?php echo $queryString; ?>" />
	<?php endif; ?>
	<meta charset="utf-8">
	<title>E233系LEDシミュレータ ver.3.0</title>
	<link rel="stylesheet" href="/e233/css/fonts/font.css?var=<?php echo filemtime($_SERVER['DOCUMENT_ROOT'] . '/e233/css/fonts/font.css'); ?>">
	<link rel="stylesheet" href="/e233/css/main.css?var=<?php echo filemtime($_SERVER['DOCUMENT_ROOT'] . '/e233/css/main.css'); ?>">
	<script type="module" src="/e233/js/main.js?var=<?php echo filemtime($_SERVER['DOCUMENT_ROOT'] . '/e233/js/main.js'); ?>"></script>
	<script src="/e233/js/animation.js?var=<?php echo filemtime($_SERVER['DOCUMENT_ROOT'] . '/e233/js/animation.js'); ?>"></script>  
	<script src="/e233/js/network.js?var=<?php echo filemtime($_SERVER['DOCUMENT_ROOT'] . '/e233/js/network.js'); ?>"></script>  
	<script type="module" src="/e233/js/canvas.js?var=<?php echo filemtime($_SERVER['DOCUMENT_ROOT'] . '/e233/js/canvas.js'); ?>"></script>
	<script type="module" src="/e233/js/ui.js?var=<?php echo filemtime($_SERVER['DOCUMENT_ROOT'] . '/e233/js/ui.js'); ?>"></script>
</head>
<body class="loading">
	<DIV id="img-area" class="img-area">
		<CANVAS id="mainled" width="609" height="300"></CANVAS>
	</DIV>
	<DIV id="control-panel">
		<DIV id="led-controller-area">
			<?php
			// data.jsonを読み込む
			$data = [];
			if (file_exists($dataFilePath)) {
				$json = file_get_contents($dataFilePath);
				$data = json_decode($json, true);
			}
			?>
			<div>
			<div class="input-container"><input class="led-control-input-box" type="text" id="shubetsu-textbox" placeholder="種別を入力" title="種別を入力"><div class="only-smartphone led-control-input-pull-down">▼</div></div>
			<?php
			// 種別リスト生成
			echo '<select id="select-shubetsu" size="6" class="led-control-box led-control-select-box">';
			echo '<option value="0" selected>種別無表示</option>';
			if (!empty($data['shubetsu'])) {
				foreach ($data['shubetsu'] as $group) {
					if (isset($group['label'])) {
						echo '<optgroup label="' . htmlspecialchars($group['label']) . '">';
					}
					foreach ($group['options'] as $opt) {
						$value = htmlspecialchars($opt['value']);
						$label = htmlspecialchars($opt['text']);
						$selected = isset($opt['selected']) && $opt['selected'] ? ' selected' : '';
						echo "<option value=\"$value\"$selected>$label</option>";
					}
					if (isset($group['label'])) {
						echo '</optgroup>';
					}
				}
			}
			echo '</select>';
			?>
			</div><div>
			<div class="input-container"><input class="led-control-input-box" type="text" id="ikisaki-textbox" placeholder="行先を入力" title="行先を入力"><div class="only-smartphone led-control-input-pull-down">▼</div></div>
			<?php
			// 行先リスト生成
			echo '<select id="select-ikisaki" size="6" class="led-control-box led-control-select-box">';
			echo '<option value="0" selected>行先無表示</option>';
			if (!empty($data['ikisaki'])) {
				foreach ($data['ikisaki'] as $group) {
					if (isset($group['label'])) {
						echo '<optgroup label="' . htmlspecialchars($group['label']) . '">';
					}
					foreach ($group['options'] as $opt) {
						$value = htmlspecialchars($opt['value']);
						$label = htmlspecialchars($opt['text']);
						$selected = isset($opt['selected']) && $opt['selected'] ? ' selected' : '';
						echo "<option value=\"$value\"$selected>$label</option>";
					}
					if (isset($group['label'])) {
						echo '</optgroup>';
					}
				}
			}
			echo '</select>';
			?></div><div id="color-container">
				<div><select id="color-select-presets" title="帯色を選択">
					<option>---帯色を選択---</option>
					<option value="0">0番台</option>
					<option value="1000">1000番台</option>
					<option value="2000">2000番台</option>
					<option value="3000">3000番台</option>
					<option value="5000">5000番台</option>
					<option value="6000">6000番台</option>
					<option value="7000">7000番台</option>
					<option value="8000">8000番台</option>
				</select><input type="color" id="color-input-box" value="#000000" title="帯色選択" class="led-control-box"></div>
				<button id="no-color-button">帯なし</button></div>
		</DIV>
		<DIV id="" class="button-area">
			<BUTTON class="large-button" id="random-shubetsu-button"><img src="/e233/resources/img/buttons/rnd_shubetsu.png">ランダム種別</BUTTON><BUTTON class="large-button" id="random-ikisaki-button"><img src="/e233/resources/img/buttons/rnd_ikisaki.png">ランダム行先</BUTTON><BUTTON class="large-button" id="random-shubetsu-ikisaki-button"><img src="/e233/resources/img/buttons/rnd_shubetsuandikisaki.png">ランダム種別+行先</BUTTON><BUTTON class="large-button" id="random-shubetsu-ikisaki-color-button"><img src="/e233/resources/img/buttons/rnd_all.png">ランダム種別+行先+帯色</BUTTON><BUTTON class="large-button" id="random-color-button"><img src="/e233/resources/img/buttons/rnd_clr.png">ランダム帯色</BUTTON>
		</DIV>
		<DIV id="" class="button-area">
			<BUTTON id="save-image-button" class="large-button"><img src="/e233/resources/img/buttons/dl.png">画像を保存</BUTTON><BUTTON class="large-button" id="tweet-button"><img src="/e233/resources/img/buttons/tw.png">今の表示をTwitterに投稿</BUTTON><BUTTON class="large-button" id="tweet-animation-button" disabled><img src="/e233/resources/img/buttons/tw_animation.png">アニメーションをTwitterに投稿</BUTTON>
		</DIV>
		<div id="animations-and-article-container">
			<DIV id="animations-container">
				<div>アニメーション</div>
				<div id="animation-controls">
					<BUTTON class="animation-button" id="animation-add-frame-button">+ 記録</BUTTON><BUTTON id="animation-play-button" disabled class="animation-button"><img src="/e233/resources/img/buttons/play.png">再生</BUTTON><BUTTON id="animation-stop-button" disabled class="animation-button"><img src="/e233/resources/img/buttons/stop.png"> 停止</BUTTON><span>スピード：速<INPUT type="range" max="10000" min="500" value="2000" id="animation-interval-range" height="1.0em">遅</span><BUTTON id="animation-reset-button" disabled class="animation-button">× リセット</BUTTON>
				</div>
				<DIV id="animation-list-container">
					<span id="animation-count">0件</span>
					<ul id="animation-list"></ul>
				</DIV>
				<DIV class="animation-description-label"></DIV>
			</DIV>
		</div>
	</DIV>

	<!-- 修飾用 -->
	<div id="color-bar" class="accessory-bar"></div>
	<div id="bottom-bar1" class="accessory-bar"></div>
	<div id="bottom-bar2" class="accessory-bar"></div>

	<div id="file-time"><?php echo filemtime($dataFilePath); ?></div>
</body>
</html>