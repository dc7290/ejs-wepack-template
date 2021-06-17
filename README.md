# ejs-wepack-template

テンプレートエンジンに ejs を採用した
webpack のスターターキットです。

## 目次

- [特徴](#features)
- [使い方](#usage)
- [ディレクトリ構造](#directory)
- [画像](#image)
- [ejs ファイルでの注意点](#ejs-note)
- [元から入っている ejs,scss,js ファイル](#files)

## <a name="features"></a>特徴

- ejs,scss
- ディレクトリ構造に基づいてルーティングを決定
- 画像を自動で最適化
- ESLint,Stylelint を設定済み
- autoprefixer,babel でクロスブラウザ対応

## <a name="usage"></a>使い方

### 開発

1. このリポジトリをクローン、または zip ファイルでダウンロードして、ローカルで開いてください。

2. 以下のコマンドを実行してください。

```bash
yarn # npm i
yarn start # npm start
```

自動でローカルサーバーが立ち上がるので、それぞれのファイルを編集して作業します。

### 本番

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

``` html
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
  }
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

これで`src/components/header.ejs`という指定になります。  
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

## <a name="files"></a>元から入っている ejs,scss,js ファイル

ある程度汎用的な記述はすでに用意しているものがあるので、解説します。

### EJS

[`components/image.ejs`](blob/main/src/components/image.ejs)

```html
<picture>
  <source <% if (lazy) { % />
  data-<% } %>srcset="<%= src + '?webp' %>" type="image/webp" /> <img <% if (lazy) { % />data-<% } %>src="<%= src %>"
  width="<%= width %>" height="<%= height %>" alt="<%= alt %>" class="lazyload <%= className %>" />
</picture>
```

webp 変換機能付きの遅延読み込み画像コンポーネントです。
渡せるパラメータを表にします。

| name      | type    | required | default | description                                                                                                              |
| --------- | ------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------ |
| src       | string  | true     |         | 画像のパスを入力します。このコンポーネントを include するファイルからの相対パスかエイリアスを用いた指定が可能です。      |
| width     | number  | false    | null    | オリジナル画像の幅を指定します。コンテンツレイアウトシフトやレンダリング速度の向上のため、指定することをお勧めします。   |
| height    | number  | false    | null    | オリジナル画像の高さを指定します。コンテンツレイアウトシフトやレンダリング速度の向上のため、指定することをお勧めします。 |
| alt       | string  | false    | ''      | 代替テキスト                                                                                                             |
| className | string  | false    | ''      | img タグに付加したいクラス名を指定できます。                                                                             |
| lazy      | boolean | false    | true    | 遅延読み込みをするかどうかを選択できます。デフォルトは`true`です。                                                       |

### SCSS

#### mixin

- メディアクエリ

メディアクエリを簡潔に。

[`scss/vars/mixins/__breakpoints.scss`](blob/main/src/scss/vars/mixins/__breakpoints.scss)

```scss
@use 'sass:map';
@use 'sass:meta';

@use '../variables';

@mixin media($breakpoint) {
  @if map.has-key(variables.$breakpoints, $breakpoint) {
    @media (min-width: #{meta.inspect(map.get(variables.$breakpoints, $breakpoint))}) {
      @content;
    }
  } @else {
    @error "指定されたブレークポイントは定義されていません。" + "指定できるブレークポイントは次のとおりです。 -> #{map.keys($breakpoints)}";
  }
}
```

`使う側のscss`

```scss
@use '../vars/mixins';

.title {
  @include mixins.media(sm) {
    // 640px 以上のスタイル
  }
}
```

#### variables

scss 変数。

[`scss/vars/_variables.scss`](blob/main/src/scss/vars/_variables.scss)

```scss
/* break points */
$breakpoints: (
  sm: 640px,
  md: 768px,
  lg: 1024px,
  xl: 1280px,
  xxl: 1536px,
);

/* content width */
$content-width: 85vw;
$content-width-sm: 600px;
$content-width-md: 720px;
$content-width-lg: 960px;
$content-width-xl: 1180px;
$content-width-xxl: 1400px;

/* colors */
$color-black: #333;
```

- $breakpoints

メディアクエリの mixin で用いている値です。
ブレイクポイントをここで管理することで、情報を一元化します。

- $content-width

この後に紹介する`.container`のスタイルに用いる変数です。

- $color

プロジェクトごとの色を管理します。
IE 対応の必要がなければ、css 変数を用いた方がアニメーションで用いたりできるので、便利かと思います。

#### container クラス

[`scss/modules/_container.scss`](blob/main/src/scss/modules/_container.scss)

```scss
@use '../vars/mixins';
@use '../vars/variables';

.container {
  width: variables.$content-width;
  margin-right: auto;
  margin-left: auto;

  @include mixins.media(sm) {
    width: variables.$content-width-sm;
  }
  @include mixins.media(md) {
    width: variables.$content-width-md;
  }
  @include mixins.media(lg) {
    width: variables.$content-width-lg;
  }
  @include mixins.media(xl) {
    width: variables.$content-width-xl;
  }
  @include mixins.media(xxl) {
    width: variables.$content-width-xxl;
  }
}

.sm\:container {
  @include mixins.media(sm) {
    width: variables.$content-width-sm;
    margin-right: auto;
    margin-left: auto;
  }
  @include mixins.media(md) {
    width: variables.$content-width-md;
  }
  @include mixins.media(lg) {
    width: variables.$content-width-lg;
  }
  @include mixins.media(xl) {
    width: variables.$content-width-xl;
  }
  @include mixins.media(xxl) {
    width: variables.$content-width-xxl;
  }
}

.md\:container {
  @include mixins.media(md) {
    width: variables.$content-width-md;
    margin-right: auto;
    margin-left: auto;
  }
  @include mixins.media(lg) {
    width: variables.$content-width-lg;
  }
...
```

いわゆる container クラスです。
設定ファイルの$content-width を元に width を決めて、mx-auto のスタイルです。

それぞれのブレイクポイント以上でのみ効く container クラスも用意しています。
例: .md:container -> 768px 以上で container

### JavaScript

#### ページ内リンクのスムーズスクロール

[`js/utils/inPageScroll.js`](blob/main/src/js/utils/inPageScroll.js)

a タグを使ったページ内リンクをスムーズスクロールにしています。

#### 360px 未満の viewport 処理

[`js/utils/windowNarrow.js`](blob/main/src/js/utils/windowNarrow.js)

[こちら](https://zenn.dev/tak_dcxi/articles/690caf6e9c4e26#360px-%E6%9C%AA%E6%BA%80%E3%81%AF-js-%E3%81%A7-viewport-%E3%82%92%E5%9B%BA%E5%AE%9A%E3%81%99%E3%82%8B)の記事を参考にしました。

#### webfont の遅延読み込み

[`js/utils/fontLoad.js`](blob/main/src/js/utils/fontLoad.js)

`webfontloader`を使って Web Font の遅延読み込みを行います。
デフォルトではコメントアウトしていますので、使う場合は`src/js/index.js`のコメントを外してください。
