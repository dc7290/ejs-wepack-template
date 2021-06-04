const path = require('path')

const portfinder = require('portfinder-sync')

const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

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
    assetModuleFilename: 'assets/images/[name]-[contenthash][ext]',
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
        test: /\.(jpe?g|png)$/i,
        type: 'asset',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      alwaysWriteToDisk: true,
      filename: 'index.html',
      template: path.resolve(__dirname, './pages/index.ejs'),
    }),
    new HtmlWebpackHarddiskPlugin(),
    new MiniCssExtractPlugin({
      filename: 'assets/css/[name].css',
      // chunkFilename: '[id].css',
    }),
    new ImageMinimizerPlugin({
      minimizerOptions: {
        plugins: [['gifsicle', { interlaced: true }], ['mozjpeg'], ['pngquant'], ['svgo']],
      },
    }),
    new CopyPlugin({
      patterns: [{ from: 'public', to: '' }],
    }),
    new CleanWebpackPlugin(),
  ],
  stats: isDev ? 'minimal' : 'normal',
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
      }),
      new CssMinimizerPlugin(),
    ],
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname),
      src: path.resolve(__dirname, './src'),
      images: path.resolve(__dirname, './src/images'),
    },
  },
}

module.exports = config
