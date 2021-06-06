const fs = require('fs')
const path = require('path')

const globby = require('globby')
const portfinder = require('portfinder-sync')
const queryString = require('query-string')

const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const StylelintPlugin = require('stylelint-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')

const { extendDefaultPlugins } = require('svgo')

const isDev = process.env.NODE_ENV === 'development'

/**
 * @type {import("webpack").Configuration} configuration
 */
const config = {
  mode: isDev ? 'development' : 'production',
  target: isDev ? 'web' : 'browserslist',
  entry: './src/js/index.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'assets/js/main.js',
  },
  devServer: {
    contentBase: path.resolve(__dirname, './dist'),
    open: true,
    host: '0.0.0.0',
    port: portfinder.getPort(8000),
    useLocalIp: true,
    watchContentBase: true,
    hot: true,
  },
  cache: {
    type: 'filesystem',
  },
  devtool: isDev ? 'eval-cheap-source-map' : false,
  module: {
    rules: [
      {
        test: /\.js$/i,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env', { useBuiltIns: 'usage', corejs: '3.13', targets: 'defaults' }]],
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.ejs$/i,
        use: [
          {
            loader: 'html-loader',
            options: {
              sources: {
                list: [
                  '...',
                  {
                    tag: 'img',
                    attribute: 'data-src',
                    type: 'src',
                  },
                  {
                    tag: 'img',
                    attribute: 'data-srcset',
                    type: 'srcset',
                  },
                ],
                urlFilter: (_, value) => {
                  if (/^\//.test(value)) {
                    return false
                  }
                  return true
                },
              },
            },
          },
          {
            loader: 'template-ejs-loader',
            options: {
              root: path.resolve(__dirname, './src/components'),
            },
          },
        ],
      },
      {
        test: /\.(sa|sc|c)ss$/i,
        use: [isDev ? 'style-loader' : MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader'],
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        type: 'asset',
        use: {
          loader: ImageMinimizerPlugin.loader,
          options: {
            minimizerOptions: {
              plugins: [
                ['gifsicle', { interlaced: true }],
                ['mozjpeg', { quality: 75, progressive: true }],
                ['pngquant', { quality: [0.6, 0.8] }],
                ['svgo', { plugins: extendDefaultPlugins([{ name: 'removeViewBox', active: false }]) }],
              ],
            },
          },
        },
        generator: {
          filename({ filename }) {
            return filename.replace(/^src/, 'assets')
          },
        },
      },
      {
        test: /\.(jpe?g|png)$/i,
        resourceQuery: /webp/,
        use: {
          loader: ImageMinimizerPlugin.loader,
          options: {
            minimizerOptions: {
              plugins: [['imagemin-webp', { quality: 85 }]],
            },
          },
        },
        type: 'asset',
        generator: {
          filename({ filename }) {
            return filename.replace(/^src/, 'assets').replace(/\.(jpe?g|png)$/i, '.webp')
          },
        },
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: 'assets/css/[name].css' }),
    new CopyPlugin({ patterns: [{ from: 'public', to: '' }] }),
    new CleanWebpackPlugin(),
    new StylelintPlugin({ files: './src/scss/**/*.scss', fix: true, lintDirtyModulesOnly: isDev ? true : false }),
    new ESLintPlugin({ lintDirtyModulesOnly: isDev ? true : false }),
  ],
  stats: isDev ? 'minimal' : 'normal',
  optimization: {
    minimizer: [new TerserPlugin({ parallel: true }), new CssMinimizerPlugin()],
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname),
      src: path.resolve(__dirname, './src'),
      images: path.resolve(__dirname, './src/images'),
    },
  },
}

module.exports = async () => {
  const [staticPaths, dynamicPaths] = await Promise.all([globby('pages/**/index.ejs'), globby(['pages/**/[*.ejs'])])

  staticPaths.forEach((staticPath) => {
    config.plugins.push(
      new HtmlWebpackPlugin({
        alwaysWriteToDisk: true,
        filename: staticPath.replace(/^pages\//, '').replace(/\.ejs$/, '.html'),
        template: path.resolve(__dirname, staticPath),
      })
    )
  })

  dynamicPaths.forEach((dynamicPath) => {
    if (!dynamicPath.endsWith('].ejs')) {
      throw Error(`"${dynamicPath}": []でファイル名を囲ってください。(例: [userId].ejs)`)
    }

    const source = fs.readFileSync(path.resolve(__dirname, dynamicPath), 'utf-8')
    const dataForGenerated = source.match(/<%#([^%]*)%>/)[1]
    const dataJsonPath = dataForGenerated.match(/dataFile:\s*(["'`])(.*)\1/)[2]
    const params = dataForGenerated.match(/paramsKey:\s*(["'`])(.*)\1/)[2]

    const contents = JSON.parse(fs.readFileSync(path.resolve(__dirname, dataJsonPath), 'utf-8'))
    contents.forEach((content, i) => {
      config.plugins.push(
        new HtmlWebpackPlugin({
          alwaysWriteToDisk: true,
          filename: dynamicPath
            .replace(/^pages\//, '')
            .replace(/\[.*\]/, `${content[params]}/`)
            .replace(/\.ejs$/, 'index.html'),
          template: `!${require.resolve('html-loader')}??ruleSet[1].rules[1].use[0]!${require.resolve(
            'template-ejs-loader'
          )}?${queryString.stringify({
            root: path.resolve(__dirname, './src/components'),
            data: JSON.stringify({ data: content, index: i }),
          })}!${path.resolve(__dirname, dynamicPath)}`,
        })
      )
    })
  })

  config.plugins.push(new HtmlWebpackHarddiskPlugin())

  return config
}
