//LED実機制御サーバにリクエストを送る
function requestRealLEDServer(ikiId, shuId) {
	const selfUrl = new URL(location.href);
	let ip = selfUrl.hostname;
	//ローカル環境で実行している場合はLED制御サーバにリクエストする
	if (ip.match(/^\d{1,3}(\.\d{1,3}){3}$/) || ip === "localhost") {
		let targetUrl = `http://${ip}:1233/e233/?q=${shuId},${ikiId}`;
		fetch(targetUrl).then(response => {
			if (!response.ok) {
				throw new Error(`HTTP error status: ${response.status}`);
			}
			return response.text();
		}).then(text => {
			console.log(text);
		}).catch(error => {
			console.error('Fetch error:', error);
		});
	}
}