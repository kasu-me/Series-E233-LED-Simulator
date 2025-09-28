window.addEventListener("DOMContentLoaded", () => {
	const isSmartphone = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
	if (isSmartphone) {
		document.body.classList.add("access-from-smartphone");
	}
	//SafariはshowPicker()に対応していない
	const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
	if (isSafari) {
		document.body.classList.add("unsupported-showpicker");
	}

	//キャッシュ対策用のバージョン文字列を取得
	const imageVersion = document.getElementById("file-time").innerText;
	//リソースのパスを取得
	const url = new URL(window.location.href);
	const resourceBasePath = url.pathname.endsWith("/") ? url.pathname : url.pathname + "/";

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

	//画像読み込み
	const images = {
		"shubetsuSmall": [],
		"shubetsuLarge": [],
		"ikisaki": [],
		"front": new Image()
	};
	const imageLoadPromises = [];

	//前景画像読み込み
	images.front.crossOrigin = "Anonymous";
	images.front.src = `${resourceBasePath}resources/img/front_b.png`;
	imageLoadPromises.push(new Promise((resolve) => {
		images.front.onload = resolve;
	}));

	//行先画像読み込み
	for (let i = 0; i <= lastImgPageCountIki; i++) {
		const img = new Image();
		images.ikisaki.push(img);
		img.crossOrigin = "Anonymous";
		img.src = `${resourceBasePath}resources/led/ledimgA${i.toString().padStart(3, "0")}.png?version=${imageVersion}`;
		imageLoadPromises.push(new Promise((resolve) => {
			img.onload = resolve;
		}));
	}

	//種別画像(小)読み込み
	for (let i = 0; i <= lastImgPageCountShuSmall; i++) {
		const img = new Image();
		images.shubetsuSmall.push(img);
		img.crossOrigin = "Anonymous";
		img.src = `${resourceBasePath}resources/led/ledtypeS${i.toString().padStart(3, "0")}.png?version=${imageVersion}`;
		imageLoadPromises.push(new Promise((resolve) => {
			img.onload = resolve;
		}));
	}

	//種別画像(大)読み込み
	for (let i = 0; i <= lastImgPageCountShuLarge; i++) {
		const img = new Image();
		images.shubetsuLarge.push(img);
		img.crossOrigin = "Anonymous";
		img.src = `${resourceBasePath}resources/led/ledtypeA${i.toString().padStart(3, "0")}.png?version=${imageVersion}`;
		imageLoadPromises.push(new Promise((resolve) => {
			img.onload = resolve;
		}));
	}

	//要素取得
	const ikiSelectBox = document.getElementById("select-ikisaki");
	const shuSelectBox = document.getElementById("select-shubetsu");
	const colorBar = document.getElementById("color-bar");
	const shuTextBox = document.getElementById("shubetsu-textbox");
	const ikiTextBox = document.getElementById("ikisaki-textbox");

	//キャンバス設定
	const canvas = document.getElementById("mainled");
	if (!canvas || !canvas.getContext) {
		return false;
	}
	const ctx = canvas.getContext('2d');
	ctx.imageSmoothingEnabled = false;

	//LEDを表示する
	function displayLED(ikiId, shuId, color, isFromTextBox = false) {
		//キャンバスを空にする
		clearCanvas();

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
			setLargeShubetsuImg(shuImageNumber, 0, 33 * shuImageY, 128, 32, 113, 16, 384, 96, true);
		} else {
			setShubetsuImg(shuImageNumber, 51 * shuImageY, 0, 48, 32, 113, 16, 144, 96, false);
			setIkisakiImg(ikiImageNumber, 0, 33 * ikiImageY, 80, 32, 257, 16, 240, 96, true);
		}
		setColorToDisplay(color);

		//ボタン要素等の状態を更新
		ikiSelectBox.disabled = isLargeType;

		//テキストボックス入力以外で呼ばれた場合はテキストボックスに反映
		if (!isFromTextBox) {
			updateTextBoxWithCurrentSettings()
		}

		//LED制御サーバにリクエストを送信
		requestRealLEDServer(ikiSelectBox.value, shuSelectBox.value);
	}
	//セレクトボックスの値からLEDを表示
	function displayLEDWithCurrentSettings(isFromTextBox = false) {
		displayLED(ikiSelectBox.value, shuSelectBox.value, colorInputBox.value, isFromTextBox);
	}
	//セレクトボックスの値からテキストボックスの値を更新
	function updateTextBoxWithCurrentSettings() {
		ikiTextBox.value = ikiSelectBox.selectedIndex != 0 ? ikiSelectBox.options[ikiSelectBox.selectedIndex].text : "";
		shuTextBox.value = shuSelectBox.selectedIndex != 0 ? shuSelectBox.options[shuSelectBox.selectedIndex].text : "";
	}

	//CANVAS系

	//CANVASに前景画像を設置
	function setFrontImage() {
		ctx.drawImage(images.front, 0, 0);
	}

	//CANVASに画像を読み込み opt=trueで最終的に前景画像も設置
	function setImageToCanvas(imgSrc, x1, y1, x2, y2, x3, y3, x4, y4, opt) {
		var img = new Image();
		img.crossOrigin = "Anonymous";
		img.src = imgSrc;
		img.onload = function () {
			ctx.drawImage(img, x1, y1, x2, y2, x3, y3, x4, y4);
			if (opt) {
				setFrontImage();
			}
		}
	}

	//CANVASに行先画像を表示 opt=trueで最終的に前景画像も設置
	function setIkisakiImg(imageNumber, x1, y1, x2, y2, x3, y3, x4, y4, opt) {
		ctx.drawImage(images.ikisaki[imageNumber], x1, y1, x2, y2, x3, y3, x4, y4);
		if (opt) {
			setFrontImage();
		}
	}

	//CANVASに種別画像を表示 opt=trueで最終的に前景画像も設置
	function setShubetsuImg(imageNumber, x1, y1, x2, y2, x3, y3, x4, y4, opt) {
		ctx.drawImage(images.shubetsuSmall[imageNumber], x1, y1, x2, y2, x3, y3, x4, y4);
		if (opt) {
			setFrontImage();
		}
	}

	//CANVASに大きな種別画像を表示 opt=trueで最終的に前景画像も設置
	function setLargeShubetsuImg(imageNumber, x1, y1, x2, y2, x3, y3, x4, y4, opt) {
		ctx.drawImage(images.shubetsuLarge[imageNumber], x1, y1, x2, y2, x3, y3, x4, y4);
		if (opt) {
			setFrontImage();
		}
	}

	//CANVASに帯色を設定
	function setColorToDisplay(color) {
		ctx.fillStyle = color;
		ctx.fillRect(0, 4, 55, 111);
		ctx.fillRect(554, 4, 55, 111);
		colorBar.style.background = color;
	}

	//CANVASを空にする
	function clearCanvas() {
		ctx.fillStyle = "rgb(68,68,68)";
		ctx.fillRect(0, 0, 600, 300);
	}

	//CANVAS上のイメージを保存
	function saveCanvas() {
		const imageType = "image/png";
		const fileName = "e233ledsimulator.png";
		saveFromDataUrl(getDataUrlFromCanvas(imageType), fileName);
	}

	//CANVASの内容をdataURLで取得
	function getDataUrlFromCanvas(imageType) {
		const dataUrl = canvas.toDataURL(imageType);
		return dataUrl;
	}

	// dataURLをBlobデータに変換
	function dataUrlToBlob(dataUrl) {
		const base64 = dataUrl.split(',');
		const data = atob(base64[1]);
		const mime = base64[0].split(':')[1].split(';')[0];
		const buf = new Uint8Array(data.length);
		for (var i = 0; i < data.length; i++) {
			buf[i] = data.charCodeAt(i);
		}
		var blob = new Blob([buf], {
			type: mime
		});
		return blob;
	}

	// 画像のダウンロード
	function saveFromDataUrl(dataUrl, fileName) {
		const a = document.createElement("a");
		a.href = dataUrl;
		a.download = fileName;
		a.click();
	}

	//CANVAS系ここまで

	//アニメーション初期化
	const tweetAnimationButton = document.getElementById("tweet-animation-button");
	const animation = new Animation(document.getElementById("animation-list-container"), document.getElementById("animation-controls"), tweetAnimationButton);

	//各種コントロール要素イベント付与
	const colorInputBox = document.getElementById("color-select-box");

	//コントローライベント
	//セレクトボックス
	document.querySelectorAll(".led-control-box").forEach(elm => {
		elm.addEventListener("input", () => {
			displayLEDWithCurrentSettings();
		});
	});
	//テキストボックス
	document.querySelectorAll(".led-control-input-box").forEach(elm => {
		elm.addEventListener("input", () => {
			const ikiText = ikiTextBox.value;
			const shuText = shuTextBox.value;

			ikiSelectBox.value = ikiText == "" ? 0 : ([...ikiSelectBox.options].find(opt => opt.text === ikiText)?.value ?? ikiSelectBox.value);
			shuSelectBox.value = shuText == "" ? 0 : ([...shuSelectBox.options].find(opt => opt.text === shuText)?.value ?? shuSelectBox.value);

			displayLEDWithCurrentSettings(true);
		});
		elm.addEventListener("blur", () => {
			const ikiText = ikiTextBox.value;
			const shuText = shuTextBox.value;

			if (ikiText === "行先無表示") {
				ikiTextBox.value = "";
			}
			if (shuText === "種別無表示") {
				shuTextBox.value = "";
			}

			updateTextBoxWithCurrentSettings()
		});
	});
	//プルダウン(スマホ用)
	document.querySelectorAll(".led-control-input-pull-down").forEach(elm => {
		elm.addEventListener("click", () => {
			const selectBox = elm.parentElement.parentElement.querySelector(".led-control-select-box")
			selectBox.showPicker();
			selectBox.focus();
			selectBox.click();
		});
	});

	//画像保存ボタンイベント
	document.getElementById("save-image-button").addEventListener("click", () => {
		saveCanvas();
	});

	//ランダムボタンイベント
	function setRandomIkiToSelectBox() {
		const randomIkiId = Math.floor(Math.random() * (maxIkiId)) + 1;
		ikiSelectBox.value = randomIkiId;
		return randomIkiId;
	}
	function setRandomShuToSelectBox() {
		const randomShuId = Math.floor(Math.random() * (maxShuSmallId)) + 1;
		shuSelectBox.value = randomShuId;
		return randomShuId;
	}
	function setRandomColorToInputBox() {
		const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
		colorInputBox.value = randomColor;
		return randomColor;
	}

	document.getElementById("random-ikisaki-button").addEventListener("click", () => {
		setRandomIkiToSelectBox();
		displayLEDWithCurrentSettings();
	});
	document.getElementById("random-shubetsu-button").addEventListener("click", () => {
		setRandomShuToSelectBox();
		displayLEDWithCurrentSettings();
	});
	document.getElementById("random-shubetsu-ikisaki-button").addEventListener("click", () => {
		setRandomIkiToSelectBox();
		setRandomShuToSelectBox();
		displayLEDWithCurrentSettings();
	});
	document.getElementById("random-shubetsu-ikisaki-color-button").addEventListener("click", () => {
		setRandomIkiToSelectBox();
		setRandomShuToSelectBox();
		setRandomColorToInputBox();
		displayLEDWithCurrentSettings();
	});
	document.getElementById("random-color-button").addEventListener("click", () => {
		setRandomColorToInputBox();
		displayLEDWithCurrentSettings();
	});
	document.getElementById("no-color-button").addEventListener("click", () => {
		colorInputBox.value = "#bbbbbb";
		displayLEDWithCurrentSettings();
	});

	//Twitter投稿ボタンイベント
	document.getElementById("tweet-button").addEventListener("click", () => {
		const ikiId = ikiSelectBox.value;
		const shuId = shuSelectBox.value;
		const color = colorInputBox.value.slice(1);
		const tweetText = encodeURIComponent(`E233系側面LEDシミュレータで「${shuSelectBox.options[shuSelectBox.selectedIndex].text} ${ikiSelectBox.options[ikiSelectBox.selectedIndex].text}」を帯色${colorInputBox.value}で表示しました！`);
		const tweetUrl = encodeURIComponent(`https://e233.kasu.me/?shu=${shuId}&iki=${ikiId}&col=${color}`);
		const viaAccount = "Omiya_Shinobu";
		tweet(tweetText, tweetUrl, viaAccount);
	});
	tweetAnimationButton.addEventListener("click", () => {
		if (animation.list.length === 0) {
			return;
		} else {
			const animationData = animation.list.map(item => `${item.shuId},${item.ikiId}`).join(',');
			const color = colorInputBox.value.slice(1);
			const tweetText = encodeURIComponent(`E233系側面LEDシミュレータで「${animation.list[0].text}」を含む${animation.list.length}件のアニメーションを帯色${colorInputBox.value}で作成しました！`);
			const tweetUrl = encodeURIComponent(`https://e233.kasu.me/?cmd=animation&data=${animationData}&col=${color}`);
			const viaAccount = "Omiya_Shinobu";
			tweet(tweetText, tweetUrl, viaAccount);
		}
	});
	function tweet(tweetText, tweetUrl, viaAccount) {
		const url = `https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}&via=${viaAccount}`;
		window.open(url, '_blank');
	}

	//アニメーションボタンイベント
	document.getElementById("animation-add-frame-button").addEventListener("click", () => {
		animation.addList(ikiSelectBox.value, shuSelectBox.value, `${shuSelectBox.options[shuSelectBox.selectedIndex].text} ${ikiSelectBox.options[ikiSelectBox.selectedIndex].text}`);
	});
	document.getElementById("animation-reset-button").addEventListener("click", () => {
		animation.clearList();
	});
	document.getElementById("animation-play-button").addEventListener("click", () => {
		animation.startAnimation((ikiId, shuId) => {
			ikiSelectBox.value = ikiId;
			shuSelectBox.value = shuId;
			displayLEDWithCurrentSettings();
		});
	});
	document.getElementById("animation-stop-button").addEventListener("click", () => {
		animation.stopAnimation();
	});

	//各種コントロール要素イベント付与ここまで

	//画像全ての読み込みが終わったら初期表示
	Promise.all(imageLoadPromises).then(() => {
		const queryString = window.location.search;
		//クエリパラメータが無ければデフォルト表示、あれば指定された内容で表示
		if (queryString) {
			const urlParams = new URLSearchParams(queryString);

			//色
			const initColor = "#" + urlParams.get('col') ?? "000000";
			colorInputBox.value = initColor;

			//アニメーション
			if (urlParams.get('cmd') === 'animation' && urlParams.get('data')) {
				const animationDatas = urlParams.get('data').split(',');
				animation.clearList();
				for (let i = 0; i < animationDatas.length; i += 2) {
					animation.addList(animationDatas[i + 1], animationDatas[i], `${[...shuSelectBox.options].find(opt => opt.value === animationDatas[i])?.text} ${[...ikiSelectBox.options].find(opt => opt.value === animationDatas[i + 1])?.text}`);
				}
				document.getElementById("animation-play-button").click();
			}
			//アニメーション以外の表示
			else {
				const initIki = urlParams.get('iki') ?? 0;
				const initShu = urlParams.get('shu') ?? 0;
				ikiSelectBox.value = initIki
				shuSelectBox.value = initShu;
				displayLEDWithCurrentSettings();
			}
		} else {
			displayLEDWithCurrentSettings();
		}

		console.log("===============================================");
		console.log("E233系側面LEDシミュレーター 3");
		console.log("SeriesE233 LED Simulator 3");
		console.log("version 3.0.3.0 / Last Updated : 2025/09/28");
		console.log("Made by M_Kasumi (Twitter:@Omiya_Shinobu)");
		console.log("===============================================");
	});

});