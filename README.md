# ejs-wepack-template

テンプレートエンジンに ejs を採用した
webpack のスターターキットです。

## 目次

- [特徴](#features)
- [使い方](#usage)
- [ディレクトリ構造](#directory)
- [画像](#image)
- [ejs ファイルでの注意点](#ejs-note)

## <a name="features"></a>特徴

- ejs,scss
- ディレクトリ構造に基づいてルーティングを決定
- 画像を自動で最適化
- ESLint,Stylelint を設定済み
- autoprefixer,babel でクロスブラウザ対応

## <a name="usage"></a>使い方

#### 開発

1. このリポジトリをクローン、または zip ファイルでダウンロードして、ローカルで開いてください。

2. 以下のコマンドを実行してください。

```bash
yarn # npm i
yarn start # npm start
```

自動でローカルサーバーが立ち上がるので、それぞれのファイルを編集して作業します。

#### 本番

ビルドするには次のコマンドを実行します。

```bash
yarn build # npm run build
```

dist ディレクトリに本番用のファイルが吐き出されます。

## <a name="directory"></a>ディレクトリ構造

### <a name="pages"></a>pages

このディレクトリにルーティングを再現します。

例:
pages/index.ejs → /index.html
pages/about/index.ejs → /about/index.html

動的ルートは[]でファイル名を囲って、
ejs ファイル内にどうルーティングするのかを設定します。

`[userId].ejs`

```
<%#
dataFile: 'src/data/users.json' <!-- 繰り返したいデータを記述したjsonファイルへのパス -->
paramsKey: 'id' <!-- ルーティングに用いたいデータのkeyパラメータ -->
%>
```

`users.json`

```json
[
  {
    "id": "user01",
    "name": "Andy"
  },
  {
    "id": "user02",
    "name": "Jon"
  },
  ...
]
```

pages/[userId].ejs → /user01/index.html, /user02/index.html, ....

### public

画像などの静的ファイルを提供できます。このフォルダのファイルは`/`に置かれて、次のように取得できます。

```html
<img src="/image.png" />
```

この時に`/`からパスを書いてください。
`/`から始まるパスのみを静的ファイルへのアクセスとして扱っています。

<p style="font-size: 0.7em">注)この方法で指定した画像ファイルは自動で最適化されません。</p>

それ以外の自動で最適化したい画像ファイルの指定の仕方については[こちら](#image)を参照ください。

### src

`ejs`、`scss`、`js`ファイルや最適化したい画像ファイル、json ファイルなど、作業ファイルをおきます。

## <a name="image"></a>画像

画像は自動で最適化されます。
対応拡張子は `jpg, png, gif, svg` です。
`jpg, png`に関しては、画像パスの後に`?webp`をつけることで、webp 画像に変換されます。

```html
<!-- 通常の指定 -->
<img src="../src/images/image.png" />
<!-- webpに変換 -->
<img src="../src/images/image.png?webp" />

<!-- エイリアスを使った指定 ('~'を最初に書くことで、続く文字をエイリアスとして認識する)  
以下は全て同じパス指定 -->
<!-- '~': '/' -->
<img src="~~src/images/image.png" />
<!-- 'src': '/src' -->
<img src="~src/images/image.png" />
<!-- 'images': '/src/images' -->
<img src="~images/image.png" />
```

## <a name="ejs-note"></a>ejs ファイルでの注意点

- include()でのパスの指定

```html
<%- include('/header') %>
<!-- または -->
<%- include('/header.ejs') %>
```

`src/components/header.ejs`という指定になります。
(ejs オプションの`root`に `src/components` を指定しているため)

- 動的ルート

[pages ディレクトリ](#pages)の記述の通り、ejs のコメントで

json ファイルへのパスとルーティングのときの URL に使う値の key を設定します。

そして自動的に json ファイル内の配列の 1 つが`data`オブジェクトで渡ってくるので、

```html
<h1><%= data.id %></h1>
```

```json
[
  {
    "id": "user01",
    "name": "Andy"
  },
  {
    "id": "user02",
    "name": "Jon"
  }
]
```

`h1`には、
/user01/index.html では`user01`が、
/user02/index.html では`user02`が入ります。
