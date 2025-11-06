let canvasUtil, colorSelectPresetSelectBox, presetColors, ikiSelectBox, shuSelectBox, colorInputBox, ikiTextBox, shuTextBox, maxIkiId, maxShuSmallId, animation, tweetAnimationButton, displayLEDWithCurrentSettings;

export function init(canvasUtilArg, animationArg, colorSelectPresetSelectBoxArg, presetColorsArg, ikiSelectBoxArg, shuSelectBoxArg, colorInputBoxArg, ikiTextBoxArg, shuTextBoxArg, maxIkiIdArg, maxShuSmallIdArg, tweetAnimationButtonArg, displayLEDWithCurrentSettingsArg) {
	canvasUtil = canvasUtilArg;
	colorSelectPresetSelectBox = colorSelectPresetSelectBoxArg;
	presetColors = presetColorsArg;
	ikiSelectBox = ikiSelectBoxArg;
	shuSelectBox = shuSelectBoxArg;
	colorInputBox = colorInputBoxArg;
	ikiTextBox = ikiTextBoxArg;
	shuTextBox = shuTextBoxArg;
	maxIkiId = maxIkiIdArg;
	maxShuSmallId = maxShuSmallIdArg;
	animation = animationArg;
	tweetAnimationButton = tweetAnimationButtonArg;
	displayLEDWithCurrentSettings = displayLEDWithCurrentSettingsArg;
}

//セレクトボックスの値からテキストボックスの値を更新
export function updateTextBoxWithCurrentSettings() {
	ikiTextBox.value = (ikiSelectBox.selectedIndex != 0 && ikiSelectBox.selectedIndex != -1) ? ikiSelectBox.options[ikiSelectBox.selectedIndex].text : "";
	shuTextBox.value = (shuSelectBox.selectedIndex != 0 && shuSelectBox.selectedIndex != -1) ? shuSelectBox.options[shuSelectBox.selectedIndex].text : "";
}
//各種コントロール要素イベント付与
export function setEventsToElements() {
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

			updateTextBoxWithCurrentSettings();
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

	//色プリセット選択ボックス
	colorSelectPresetSelectBox.querySelectorAll("option").forEach((opt, index) => {
		opt.style.backgroundColor = presetColors[index];
	});
	colorSelectPresetSelectBox.addEventListener("change", () => {
		const selectedColor = presetColors[colorSelectPresetSelectBox.selectedIndex];
		colorInputBox.value = selectedColor;
		displayLEDWithCurrentSettings();
	});

	//画像保存ボタンイベント
	document.getElementById("save-image-button").addEventListener("click", () => {
		canvasUtil.saveCanvas(canvasUtil.getDataUrlFromCanvas, canvasUtil.saveFromDataUrl);
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
		const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
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
		const tweetUrl = encodeURIComponent(`https://led.e233.app/?shu=${shuId}&iki=${ikiId}&col=${color}`);
		const viaAccount = "Omiya_Shinobu";
		tweet(tweetText, tweetUrl, viaAccount);
	});
	tweetAnimationButton.addEventListener("click", () => {
		if (animation.list.length === 0) {
			return;
		} else {
			const animationData = animation.list.map(item => `${item.shuId},${item.ikiId}`).join(",");
			const interval = document.getElementById("animation-interval-range").value;
			const color = colorInputBox.value.slice(1);
			const tweetText = encodeURIComponent(`E233系側面LEDシミュレータで「${animation.list[0].text}」ほか${animation.list.length}件を含むアニメーションを帯色${colorInputBox.value}で作成しました！`);
			const tweetUrl = encodeURIComponent(`https://led.e233.app/?cmd=animation&data=${animationData}&interval=${interval}&col=${color}`);
			const viaAccount = "Omiya_Shinobu";
			tweet(tweetText, tweetUrl, viaAccount);
		}
	});
	function tweet(tweetText, tweetUrl, viaAccount) {
		const url = `https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}&via=${viaAccount}`;
		window.open(url, "_blank");
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
}