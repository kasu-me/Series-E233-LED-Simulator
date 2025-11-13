import * as canvasUtil from "./canvas.js";
import * as uiUtil from "./ui.js";

window.addEventListener("DOMContentLoaded", () => {
	//UAに応じた処理
	const userAgent = navigator.userAgent;
	const isSmartphone = /iPhone|iPod|Android/i.test(userAgent);
	const isTablet = /iPad/.test(userAgent);
	if (isSmartphone && !isTablet) {
		document.body.classList.add("access-from-smartphone");
	}
	if (isTablet) {
		document.body.classList.add("access-from-tablet");
	}
	//SafariはshowPicker()に対応していない
	const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
	//if (isSafari) {
	document.body.classList.add("unsupported-showpicker");
	//}

	//キャッシュ対策用のバージョン文字列を取得
	const imageVersion = document.getElementById("file-time").innerText;
	//リソースのパスを取得
	const url = new URL(window.location.href);
	const resourceBasePath = url.pathname.endsWith("/") ? url.pathname : url.pathname + "/";

	//各種定数定義

	//1枚の画像に設定されている幕の数
	const MAKU_COUNT_PER_IMAGE_IKISAKI = 100;
	const MAKU_COUNT_PER_IMAGE_SHUBETSU_SMALL = 28;
	const MAKU_COUNT_PER_IMAGE_SHUBETSU_LARGE = 100;

	//最大番号取得
	const maxIkiId = Math.max(...[...document.querySelectorAll("#select-ikisaki option")].map(opt => opt.value));
	const maxShuSmallId = Math.max(...[...document.querySelectorAll("#select-shubetsu option")].map(opt => opt.value).filter(val => !isNaN(Number(val))));
	const maxShuLargeId = Math.max(...[...document.querySelectorAll("#select-shubetsu option")].map(opt => opt.value).filter(val => val.startsWith("C")).map(val => val.slice(1).replace(/^0*/, "")));

	//必要な画像の枚数を計算
	const lastImgPageCountIki = Math.floor(maxIkiId / MAKU_COUNT_PER_IMAGE_IKISAKI);
	const lastImgPageCountShuSmall = Math.floor(maxShuSmallId / MAKU_COUNT_PER_IMAGE_SHUBETSU_SMALL);
	const lastImgPageCountShuLarge = Math.floor(maxShuLargeId / MAKU_COUNT_PER_IMAGE_SHUBETSU_LARGE);

	//プリセット色
	const presetColors = [
		"",
		"#ff8000",//0番台
		"#09a5ff",//1000番台
		"#bbbbbb",//2000番台
		"#28ae2e",//3000番台
		"#ff002b",//5000番台
		"#77ca37",//6000番台
		"#119b68",//7000番台
		"#ffc105",//8000番台
	];

	//定数定義ここまで

	//画像読み込み
	const images = {
		"shubetsuSmall": [],
		"shubetsuLarge": [],
		"ikisaki": [],
		"front": new Image()
	};

	//コンテンツ読み込みPromise配列
	const contentLoadPromises = [];

	//フォント読み込み
	contentLoadPromises.push(document.fonts.ready);

	//前景画像読み込み
	images.front.crossOrigin = "Anonymous";
	images.front.src = `${resourceBasePath}resources/img/front_b.png`;
	contentLoadPromises.push(new Promise((resolve) => {
		images.front.onload = resolve;
	}));

	//行先画像読み込み
	for (let i = 0; i <= lastImgPageCountIki; i++) {
		const img = new Image();
		images.ikisaki.push(img);
		img.crossOrigin = "Anonymous";
		img.src = `${resourceBasePath}resources/led/ledimgA${i.toString().padStart(3, "0")}.png?version=${imageVersion}`;
		contentLoadPromises.push(new Promise((resolve) => {
			img.onload = resolve;
		}));
	}

	//種別画像(小)読み込み
	for (let i = 0; i <= lastImgPageCountShuSmall; i++) {
		const img = new Image();
		images.shubetsuSmall.push(img);
		img.crossOrigin = "Anonymous";
		img.src = `${resourceBasePath}resources/led/ledtypeS${i.toString().padStart(3, "0")}.png?version=${imageVersion}`;
		contentLoadPromises.push(new Promise((resolve) => {
			img.onload = resolve;
		}));
	}

	//種別画像(大)読み込み
	for (let i = 0; i <= lastImgPageCountShuLarge; i++) {
		const img = new Image();
		images.shubetsuLarge.push(img);
		img.crossOrigin = "Anonymous";
		img.src = `${resourceBasePath}resources/led/ledtypeA${i.toString().padStart(3, "0")}.png?version=${imageVersion}`;
		contentLoadPromises.push(new Promise((resolve) => {
			img.onload = resolve;
		}));
	}

	//要素取得
	const ikiSelectBox = document.getElementById("select-ikisaki");
	const shuSelectBox = document.getElementById("select-shubetsu");
	const colorBar = document.getElementById("color-bar");
	const shuTextBox = document.getElementById("shubetsu-textbox");
	const ikiTextBox = document.getElementById("ikisaki-textbox");
	const colorInputBox = document.getElementById("color-input-box");
	const colorSelectPresetSelectBox = document.getElementById("color-select-presets");

	//キャンバス設定
	const canvas = document.getElementById("mainled");
	if (!canvas || !canvas.getContext) {
		return false;
	}
	canvasUtil.initCanvas(canvas);

	//LEDを表示する
	function displayLED(ikiId, shuId, color, isFromTextBox = false) {
		const [rawIkiId, rawShuId] = [ikiId, shuId];

		//キャンバスを空にする
		canvasUtil.clearCanvas();

		//大きい種別画像か確認
		const isLargeType = shuId.toString().startsWith("C");

		//行先IDを各種数値に変換
		ikiId = Number(ikiId);
		const ikiImageNumber = Math.floor(ikiId / MAKU_COUNT_PER_IMAGE_IKISAKI);
		const ikiImageY = (ikiId % MAKU_COUNT_PER_IMAGE_IKISAKI);

		//種別IDを各種数値に変換
		shuId = isLargeType ? Number(shuId.slice(1).replace(/^0*/, "")) : Number(shuId);
		const shuImageNumber = isLargeType ? Math.floor(shuId / MAKU_COUNT_PER_IMAGE_SHUBETSU_LARGE) : Math.floor(shuId / MAKU_COUNT_PER_IMAGE_SHUBETSU_SMALL);
		const shuImageY = isLargeType ? (shuId % MAKU_COUNT_PER_IMAGE_SHUBETSU_LARGE) : (shuId % MAKU_COUNT_PER_IMAGE_SHUBETSU_SMALL);

		//CANVAS描画
		if (isLargeType) {
			canvasUtil.setLargeShubetsuImg(images, shuImageNumber, 0, 33 * shuImageY, 128, 32, 113, 16, 384, 96, true);
		} else {
			canvasUtil.setShubetsuImg(images, shuImageNumber, 51 * shuImageY, 0, 48, 32, 113, 16, 144, 96, false);
			canvasUtil.setIkisakiImg(images, ikiImageNumber, 0, 33 * ikiImageY, 80, 32, 257, 16, 240, 96, true);
		}
		//ボタン要素等の状態を更新
		canvasUtil.setColorToDisplay(color, colorBar, colorSelectPresetSelectBox, presetColors);
		ikiSelectBox.disabled = isLargeType;
		//テキストボックス入力以外で呼ばれた場合はテキストボックスに反映
		if (!isFromTextBox) {
			uiUtil.updateTextBoxWithCurrentSettings();
		}
		//LED制御サーバにリクエストを送信
		requestRealLEDServer(rawIkiId, rawShuId);
	}
	//セレクトボックスの値からLEDを表示
	function displayLEDWithCurrentSettings(isFromTextBox = false) {
		displayLED(ikiSelectBox.value, shuSelectBox.value, colorInputBox.value, isFromTextBox);
	}

	//アニメーション初期化
	const tweetAnimationButton = document.getElementById("tweet-animation-button");
	const animation = new Animation(document.getElementById("animation-list-container"), document.getElementById("animation-controls"), tweetAnimationButton);

	//各種コントロール要素イベント付与
	uiUtil.init(canvasUtil, animation, colorSelectPresetSelectBox, presetColors, ikiSelectBox, shuSelectBox, colorInputBox, ikiTextBox, shuTextBox, maxIkiId, maxShuSmallId, tweetAnimationButton, displayLEDWithCurrentSettings);
	uiUtil.setEventsToElements();

	//画像全ての読み込みが終わったら初期表示
	Promise.all(contentLoadPromises).then(() => {
		const queryString = window.location.search;
		//クエリパラメータが無ければデフォルト表示、あれば指定された内容で表示
		if (queryString) {
			const urlParams = new URLSearchParams(queryString);

			//色
			const initColor = "#" + (urlParams.get("col") ?? "000000");
			colorInputBox.value = initColor;

			//アニメーション
			if (urlParams.get("cmd") === "animation" && urlParams.get("data")) {
				const animationDatas = urlParams.get("data").split(",");
				animation.clearList();
				for (let i = 0; i < animationDatas.length; i += 2) {
					animation.addList(animationDatas[i + 1], animationDatas[i], `${[...shuSelectBox.options].find(opt => opt.value === animationDatas[i])?.text} ${[...ikiSelectBox.options].find(opt => opt.value === animationDatas[i + 1])?.text}`);
				}
				if (urlParams.get("interval")) {
					document.getElementById("animation-interval-range").value = urlParams.get("interval");
				}
				document.getElementById("animation-play-button").click();
			}
			//アニメーション以外の表示
			else {
				const initIki = urlParams.get("iki") ?? 0;
				const initShu = urlParams.get("shu") ?? 0;
				ikiSelectBox.value = initIki
				shuSelectBox.value = initShu;
				displayLED(initIki, initShu, initColor);
			}
		} else {
			displayLEDWithCurrentSettings();
		}

		// 画面表示
		window.dispatchEvent(new Event("readyToDisplay"));

		console.log("===============================================");
		console.log("E233系側面LEDシミュレーター 3");
		console.log("SeriesE233 LED Simulator 3");
		console.log("version 3.0.5.0 / Last Updated : 2025/10/06");
		console.log("Made by M_Kasumi (Twitter:@Omiya_Shinobu)");
		console.log("===============================================");
	});

});

window.addEventListener("readyToDisplay", () => {
	document.body.classList.remove("loading");
});