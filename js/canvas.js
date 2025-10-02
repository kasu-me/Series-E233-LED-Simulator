let canvas, ctx;

export function initCanvas(canvasElement) {
	canvas = canvasElement;
	ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;
}

export function setFrontImage(images) {
	ctx.drawImage(images.front, 0, 0);
}

export function setImageToCanvas(imgSrc, x1, y1, x2, y2, x3, y3, x4, y4, opt, images) {
	var img = new Image();
	img.crossOrigin = "Anonymous";
	img.src = imgSrc;
	img.onload = function () {
		ctx.drawImage(img, x1, y1, x2, y2, x3, y3, x4, y4);
		if (opt) {
			setFrontImage(images);
		}
	}
}

export function setIkisakiImg(images, imageNumber, x1, y1, x2, y2, x3, y3, x4, y4, opt) {
	ctx.drawImage(images.ikisaki[imageNumber], x1, y1, x2, y2, x3, y3, x4, y4);
	if (opt) {
		setFrontImage(images);
	}
}

export function setShubetsuImg(images, imageNumber, x1, y1, x2, y2, x3, y3, x4, y4, opt) {
	ctx.drawImage(images.shubetsuSmall[imageNumber], x1, y1, x2, y2, x3, y3, x4, y4);
	if (opt) {
		setFrontImage(images);
	}
}

export function setLargeShubetsuImg(images, imageNumber, x1, y1, x2, y2, x3, y3, x4, y4, opt) {
	ctx.drawImage(images.shubetsuLarge[imageNumber], x1, y1, x2, y2, x3, y3, x4, y4);
	if (opt) {
		setFrontImage(images);
	}
}

export function setColorToDisplay(color, colorBar, colorSelectPresetSelectBox, presetColors) {
	ctx.fillStyle = color;
	ctx.fillRect(0, 4, 55, 111);
	ctx.fillRect(554, 4, 55, 111);
	if (colorBar) colorBar.style.background = color;
	if (colorSelectPresetSelectBox && presetColors) {
		colorSelectPresetSelectBox.selectedIndex = (presetColors.filter(preset => preset == color).length > 0) ? presetColors.indexOf(color) : 0;
	}
}

export function clearCanvas() {
	ctx.fillStyle = "rgb(68,68,68)";
	ctx.fillRect(0, 0, 600, 300);
}

export function saveCanvas(getDataUrlFromCanvas, saveFromDataUrl) {
	const imageType = "image/png";
	const fileName = "e233ledsimulator.png";
	saveFromDataUrl(getDataUrlFromCanvas(imageType), fileName);
}

export function getDataUrlFromCanvas(imageType) {
	const dataUrl = canvas.toDataURL(imageType);
	return dataUrl;
}

export function dataUrlToBlob(dataUrl) {
	const base64 = dataUrl.split(",");
	const data = atob(base64[1]);
	const mime = base64[0].split(":")[1].split(";")[0];
	const buf = new Uint8Array(data.length);
	for (var i = 0; i < data.length; i++) {
		buf[i] = data.charCodeAt(i);
	}
	var blob = new Blob([buf], {
		type: mime
	});
	return blob;
}

export function saveFromDataUrl(dataUrl, fileName) {
	const a = document.createElement("a");
	a.href = dataUrl;
	a.download = fileName;
	a.click();
}
