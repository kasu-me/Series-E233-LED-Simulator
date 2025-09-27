<?php
	// data.jsonのパス
	$dataFilePath = $_SERVER['DOCUMENT_ROOT'] . '/resources/data.json';
?>
<!DOCTYPE html>
<html lang="ja">

<head>
	<link rel="icon" href="/resources/img/favicon.png" sizes="192x192" />
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:site" content="@Omiya_Shinobu" />
	<meta property="og:url" content="<?php echo (empty($_SERVER['HTTPS']) ? 'http://' : 'https://') . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']; ?>" />
	<meta property="og:title" content="E233系LEDシミュレータ" />
	<meta property="og:description" content="ブラウザ上でE233系(一部小田急4000形と相鉄11000系と都営10-300形と都営5500形としなの鉄道SR1系)の行先表示器を再現することができるシミュレータ。" />
	<?php if ($_SERVER['QUERY_STRING'] == "" || isset($_GET["cmd"])) : ?>
		<meta property="og:image" content="https://<?php echo $_SERVER["HTTP_HOST"] ?>/resources/img/twtr.png" />
	<?php else : ?>
		<meta property="og:image" content="https://<?php echo $_SERVER["HTTP_HOST"] ?>/resources/img/card.php?<?php echo $_SERVER["QUERY_STRING"]; ?>" />
	<?php endif; ?>
	<meta charset="utf-8">
	<title>E233系LEDシミュレータ ver.3.0</title>
	<link rel="stylesheet" href="/css/fonts/font.css?var=<?php echo filemtime($_SERVER['DOCUMENT_ROOT'] . '/css/fonts/font.css'); ?>">
	<link rel="stylesheet" href="/css/main.css?var=<?php echo filemtime($_SERVER['DOCUMENT_ROOT'] . '/css/main.css'); ?>">
	<script src="/js/main.js?var=<?php echo filemtime($_SERVER['DOCUMENT_ROOT'] . '/js/main.js'); ?>"></script>
	<script src="/js/animation.js?var=<?php echo filemtime($_SERVER['DOCUMENT_ROOT'] . '/js/animation.js'); ?>"></script>	
	<script src="/js/network.js?var=<?php echo filemtime($_SERVER['DOCUMENT_ROOT'] . '/js/network.js'); ?>"></script>	
</head>
<body>
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
			<input class="led-control-input-box" type="text" id="shubetsu-textbox" placeholder="種別を入力" title="種別を入力">
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
			<input class="led-control-input-box" type="text" id="ikisaki-textbox" placeholder="行先を入力" title="行先を入力">
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
			?></div><div><input type="color" id="color-select-box" value="#000000" title="帯色選択" class="led-control-box"></div><div><button id="no-color-button">帯なし</button></div>
		</DIV>
		<DIV id="" class="button-area">
			<BUTTON class="large-button" id="random-shubetsu-button"><img src="/resources/img/buttons/rnd_shubetsu.png">ランダム種別</BUTTON><BUTTON class="large-button" id="random-ikisaki-button"><img src="/resources/img/buttons/rnd_ikisaki.png">ランダム行先</BUTTON><BUTTON class="large-button" id="random-shubetsu-ikisaki-button"><img src="/resources/img/buttons/rnd_shubetsuandikisaki.png">ランダム種別+行先</BUTTON><BUTTON class="large-button" id="random-shubetsu-ikisaki-color-button"><img src="/resources/img/buttons/rnd_all.png">ランダム種別+行先+帯色</BUTTON><BUTTON class="large-button" id="random-color-button"><img src="/resources/img/buttons/rnd_clr.png">ランダム帯色</BUTTON>
		</DIV>
		<DIV id="" class="button-area">
			<BUTTON id="save-image-button" class="large-button"><img src="/resources/img/buttons/dl.png">画像を保存</BUTTON><BUTTON class="large-button" id="tweet-button"><img src="/resources/img/buttons/tw.png">今の表示をTwitterに投稿</BUTTON><BUTTON class="large-button" disabled><img src="/resources/img/buttons/tw_anime.png">アニメーションをTwitterに投稿</BUTTON>
		</DIV>
		<div id="animations-and-article-container">
			<DIV id="animations-container" class="button-area">
				<div>アニメーション</div>
				<div id="animation-controls">
					<BUTTON class="animation-button" id="animation-add-frame-button">+ 記録</BUTTON><BUTTON id="animation-play-button" disabled class="animation-button"><img src="/resources/img/buttons/play.png">再生</BUTTON><BUTTON id="animation-stop-button" disabled class="animation-button"><img src="/resources/img/buttons/stop.png"> 停止</BUTTON><span>スピード：速<INPUT type="range" max="10000" min="500" value="2000" id="animation-interval-range" height="1.0em">遅</span><BUTTON id="animation-reset-button" disabled class="animation-button">× リセット</BUTTON>
				</div>
				<DIV id="animation-list-container">
					<span id="animation-count">0件</span>
					<ul id="animation-list"></ul>
				</DIV>
				<DIV>▲クリックで削除▲</DIV>
			</DIV>
			<DIV id="artcle-area">
				<!--<A HREF="https://twitter.com/Omiya_Shinobu" target="_blank">これをつくったひとのTwitter</A> - バグや不具合の報告などもこちらまで。-->
				<p><SPAN style="color:#ff0000;"><B>LAST UPDATED : 2025/09/24</B></SPAN> : 大規模修正。内部構造をゼロベースで刷新。動作に変更はありません。</p>
				<p><B>★E233系LEDシミュレータって何？</B> …JR東日本E233系、都営10-300形、相鉄11000系、小田急4000形、都営5500形、しなの鉄道SR1系の側面方向表示器のLEDをブラウザ上で再現できます。作成した表示は、画像として保存したりURLで共有したりできます。スマホでも動きますが、推奨はPCのGoogle Chrome。</p>
				<p>☆少ない資料から手打ちなので、間違いがあるかも。その際はご容赦ください。<br>☆一部、他表示からの推測や架空の表示を含みます。<br>☆本シミュレータで生成した画像はご自由にお使いください。(本シミュレータは実在する鉄道車両のLED表示器の挙動を再現したものですので、そもそも私が著作権を主張することはできないと考えております。)</p>
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