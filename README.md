# E233系LEDシミュレータ
ブラウザ上で、E233系やそれに類似したLEDを搭載した車種の側面LED表示器を再現するプログラムです。

[https://e233.kasu.me/](https://e233.kasu.me/)で稼働しているものの中身です。

## 仕様
### 対応車種
- JR東日本E233系
- 都営10-300形
- 相鉄11000系
- 小田急4000形
- 都営5500形
- しなの鉄道SR1系

### URL

本アプリケーションは以下のアドレスで起動することを前提に設計されています。

`http://<アドレス>/`

`<アドレス>`は、アプリケーションをホストしているサーバのIPアドレスまたはドメイン名です。

#### URLクエリパラメータ

デフォルトの初期表示内容は無表示ですが、本アプリケーションを起動する際に以下のクエリパラメータを指定することで、初期表示内容を変更できます。

`http://<アドレス>/?iki=<行先ID>&shu=<種別ID>&col=<帯色ID>`
- `iki`: 行先表示ID
- `shu`: 種別表示ID
- `col`: 帯色ID(16進数カラーコード。先頭の`#`は不要)
### 注意点
- 少ない資料から手打ちなので、ドットに間違いを含む可能性があります。実際の表示内容を保証するものではありません。
- 一部、他表示からの推測や架空の表示を含みます。
## LED実機との同期機能について(上級者向け)
LED実機を保有している場合、表示内容を実機と同期させることが可能です。

シミュレータが稼働しているサーバとは別に実機制御用のHTTPサーバを起動する必要があります。このサーバはポート`1233`をリッスンし、`/e233`を待ち受けるようにしてください。

E233系LEDシミュレータは、`http://<稼働しているサーバのアドレス>:1233/e233?q=<種別ID>,<行先ID>`に対してGETリクエストを送信します。
### 手順
ここではRaspberry Piを使用する場合を例に説明します。
1. Raspberry PiにApacheやNginxなどのWebサーバーとPHPをインストールします。
1. 本リポジトリをRaspberry Piにクローンし、`/var/www/html`などのWebサーバーのドキュメントルートに配置します。
1. 上記で起動したサーバとは別に、実機制御用のHTTPサーバを起動します。このサーバはポート`1233`をリッスンするようにし、`/e233`を待ち受けるようにします。
	
	以下はPython3を利用した例です。
	```python
	from http.server import HTTPServer, SimpleHTTPRequestHandler
	class RequestHandler(SimpleHTTPRequestHandler, object):
		def end_headers (self):
			self.send_header('Access-Control-Allow-Origin', '*')
			SimpleHTTPRequestHandler.end_headers(self)
		def do_GET(self):
			if self.path.startswith("/e233/"):
				if "?q=" in self.path:
					self.send_response(200)
					self.send_header('Content-Type', 'text/plain; charset=utf-8')
					self.end_headers()
					# ここにLED実機に表示内容を送信するコードを記述
		def do_POST(self):
			self.do_GET()
	httpd = HTTPServer(("", 1233), RequestHandler)
	httpd.serve_forever()
	```
1. LED実機とRaspberry Piを接続します。メジャーな接続インターフェースとしてはHUB75などの規格があると思います。詳細はお使いの実機の仕様に従いGoogle等で調べてください。
1. 上記「3.」のコード中の`# ここにLED実機に表示内容を送信するコードを記述`の部分に、LED実機に表示内容を送信するコードを記述します。お使いの規格に対応したLED制御用のコードを記述してください。クエリパラメータ`q`の内容は`<種別ID>,<行先ID>`の形式で送信されます。
1. E233系LEDシミュレータのサーバと、LED実機制御用のHTTPサーバを起動します。この時起動するE233系LEDシミュレータについては、[Raspberry-Piブランチ](https://github.com/kasu-me/Series-E233-LED-Simulator/tree/raspberry-pi)の内容を利用すると良いでしょう。
1. ブラウザで`http://<Raspberry Piのアドレス>/`にアクセスし、画面上のLEDの表示内容を変更します。表示内容がLED実機と同期していることを確認します。

## 本プログラムのご利用について
- 本プログラムを利用して発生したいかなる損害についても、製作者は一切の責任を負いません。
- 本プログラムを商用目的で利用することはできません。
- 本プログラムが動作するサーバをパブリックネットワーク上に公開しないでください。
  - 本リポジトリの内容は、は既に[https://e233.kasu.me/](https://e233.kasu.me/)で稼働しているものであり、同じ内容のページが複数存在するのは単に無駄で混乱を招くだけであるためです。
  - 但し、[https://e233.kasu.me/](https://e233.kasu.me/)が2ヶ月以上停止しており、[製作者のTwitter](https://twitter.com/Omiya_Shinobu)にて復旧の見込みがアナウンスされていない場合に限り、本リポジトリの内容をパブリックネットワークに公開することを許可します。
    - その場合、本READMEの内容に基づいて公開していることを明記してください。
      - 例えば、以下のように記載してください。
	  	>[https://e233.kasu.me/](https://e233.kasu.me/)が停止しているため、規約に基づき、代理で公開しています。
	- 「停止している」とは、以下の状態を指します。
		- [https://e233.kasu.me/](https://e233.kasu.me/)から404エラーが返却される状態
		- 404エラーではなくとも、ドメインが製作者の管理下を離れ、他者のコンテンツが表示されている状態
		- [製作者のTwitter](https://twitter.com/Omiya_Shinobu)でメンテナンスを放棄した旨がアナウンスされている状態
- 本プログラムをローカルネットワーク上のサーバで利用することは問題ありません。
  - この場合、本プログラムの内容を改変して利用しても問題ありません。
- `/resources/led`ディレクトリ内の画像ファイルや、本プログラムを利用して生成した画像などは、すべてご自由にお使いください。
  - 本プログラムは実在する鉄道車両のLED表示器の表示内容を再現したものですので、そもそも私が著作権を主張することはできないと考えております。

## その他
- UIのフォントに[LINE Seed](https://seed.line.me/index_jp.html)を利用しています。このフォントは[SIL OPEN FONT LICENSE](https://licenses.opensource.jp/OFL-1.1/OFL-1.1.html)に基づき提供されており、著作権はLINEヤフー株式会社が有しています。

## 連絡先
不具合の報告やご意見等は[GitHubのIssue](https://github.com/kasu-me/Series-E233-LED-Simulator/issues)または[製作者のTwitter](https://twitter.com/Omiya_Shinobu)までお願いいたします。
