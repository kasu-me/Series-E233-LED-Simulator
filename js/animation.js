class Animation {
	interval = 0;
	timer;
	currentFrame = 0;
	isPlaying = false;
	list = [];
	uiElements = {
		list: {
			counterElement: null,
			listElement: null
		},
		buttons: {
			addButton: null,
			playButton: null,
			stopButton: null,
			resetButton: null,
			tweetButton: null
		},
		speedRange: null
	}

	constructor(listContainerElement, buttonContainerElement, tweetButtonElement) {
		this.uiElements.list.counterElement = listContainerElement.querySelector("#animation-count");
		this.uiElements.list.listElement = listContainerElement.querySelector("#animation-list");
		this.uiElements.buttons.addButton = buttonContainerElement.querySelector("#animation-add-frame-button");
		this.uiElements.buttons.playButton = buttonContainerElement.querySelector("#animation-play-button");
		this.uiElements.buttons.stopButton = buttonContainerElement.querySelector("#animation-stop-button");
		this.uiElements.buttons.resetButton = buttonContainerElement.querySelector("#animation-reset-button");
		this.uiElements.speedRange = buttonContainerElement.querySelector("#animation-interval-range");
		this.uiElements.buttons.tweetButton = tweetButtonElement;
	}
	addList(ikiId, shuId, text) {
		this.list.push({ ikiId: ikiId, shuId: shuId, text: text });
		this.refreshUI();
	}
	removeFromList(id) {
		this.list.splice(id, 1);
		this.refreshUI();
	}
	clearList() {
		this.list = [];
		this.timer = null;
		this.currentFrame = 0;
		this.isPlaying = false;
		this.refreshUI();
	}

	startAnimation(callback) {
		this.isPlaying = true;
		this.interval = parseInt(this.uiElements.speedRange.value);
		this.currentFrame = 0;
		this.timer = setInterval(() => {
			this.proceedFrame(callback);
		}, this.interval);
		this.refreshUI();
		this.proceedFrame(callback);
	}

	proceedFrame(callback) {
		this.currentFrame = this.currentFrame % this.list.length;
		const frame = this.list[this.currentFrame];
		[...this.uiElements.list.listElement.children].forEach((li, i) => {
			if (i != this.currentFrame) {
				li.classList.remove("playing");
			} else {
				li.classList.add("playing");
			}
		});
		callback(frame.ikiId, frame.shuId);
		this.currentFrame++;
	}

	stopAnimation() {
		clearInterval(this.timer);
		this.timer = null;
		this.currentFrame = 0;
		this.isPlaying = false;
		this.refreshUI();
	}

	refreshUI() {
		this.uiElements.list.listElement.innerHTML = "";
		this.uiElements.list.counterElement.innerText = `${this.list.length}件`;
		this.list.forEach((item, i) => {
			const li = document.createElement("li");
			li.textContent = `${item.text}`;
			li.addEventListener("click", () => {
				this.removeFromList(i);
			});
			this.uiElements.list.listElement.appendChild(li);
			const span = document.createElement("span");
			span.classList.add("subtext");
			span.innerText = `${item.shuId}, ${item.ikiId}`;
			li.appendChild(span);
		});
		if (this.list.length > 0) {
			this.uiElements.buttons.tweetButton.disabled = false;
			if (this.isPlaying) {
				this.uiElements.buttons.addButton.disabled = true;
				this.uiElements.buttons.playButton.disabled = true;
				this.uiElements.buttons.stopButton.disabled = false;
				this.uiElements.buttons.resetButton.disabled = true;
			} else {
				this.uiElements.buttons.addButton.disabled = false;
				this.uiElements.buttons.playButton.disabled = false;
				this.uiElements.buttons.stopButton.disabled = true;
				this.uiElements.buttons.resetButton.disabled = false;
			}
		} else {
			this.uiElements.buttons.tweetButton.disabled = true;
			this.uiElements.buttons.addButton.disabled = false;
			this.uiElements.buttons.playButton.disabled = true;
			this.uiElements.buttons.resetButton.disabled = true;
			this.uiElements.buttons.stopButton.disabled = true;
		}
	}
}
