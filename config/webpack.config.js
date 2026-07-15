const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const rootPath = process.cwd()
const distPath = path.join(rootPath, 'dist')
const srcPath = path.join(rootPath, 'src')

const ATTRIBUTES_TO_EXPAND = [
  'src', 'gltf-model', 'cover-image-url', 'footer-image-url', 'watermark-image-url',
]

const makeJsLoader = () => ({
  test: /\.js$/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: [['@babel/preset-env', { modules: 'commonjs' }]],
      plugins: [['@babel/plugin-transform-runtime', { useESModules: false }]],
    },
  },
  exclude: /node_modules/,
})

const makeTsLoader = () => ({
  test: /\.ts$/,
  loader: 'ts-loader',
  exclude: /node_modules/,
})

const makeCssLoader = () => ({
  test: /\.css$/,
  exclude: /\/assets\//,
  use: ['style-loader', 'css-loader'],
})

const makeSassLoader = () => ({
  test: /\.scss$/,
  use: ['style-loader', 'css-loader', 'sass-loader'],
})

const makeAssetLoader = () => ({
  test: /\..*$/,
  include: [path.join(srcPath, 'assets')],
  loader: path.join(__dirname, 'asset-loader.js'),
})

const makeDefaultHtmlLoader = () => ({
  test: /\.html$/,
  use: {
    loader: 'html-loader',
    options: {
      esModule: false,
      sources: {
        list: [
          '...',
          {
            tag: 'script',
            attribute: 'src',
            type: 'src',
            filter: () => false,
          },
          ...ATTRIBUTES_TO_EXPAND.map(attr => ({
            tag: '*',
            attribute: attr,
            type: 'src',
          })),
        ],
      },
    },
  },
})

const config = {
  externals: {
    'three': 'THREE',
  },
  entry: {
    turkey: path.join(srcPath, 'app.js'),
    germany: path.join(srcPath, 'app-germany.js'),
    // russia: path.join(srcPath, 'app-russia.js'),
  },
  output: {
    filename: 'bundle-[name].js',
    path: distPath,
    publicPath: '/',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(srcPath, 'index.html'),
      filename: 'index.html',
      inject: false,
      chunks: ['turkey'],
      minify: false,
    }),
    new HtmlWebpackPlugin({
      template: path.join(srcPath, 'index-germany.html'),
      filename: 'index-germany.html',
      inject: false,
      chunks: ['germany'],
      minify: false,
    }),
    // new HtmlWebpackPlugin({
    //   template: path.join(srcPath, 'index-russia.html'),
    //   filename: 'index-russia.html',
    //   inject: false,
    //   chunks: ['russia'],
    // }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(rootPath, 'external'),
          to: path.join(distPath, 'external'),
          noErrorOnMissing: true,
        },
        {
          from: path.join(srcPath, 'assets'),
          to: path.join(distPath, 'assets'),
          noErrorOnMissing: true,
        },
        {
          from: path.join(rootPath, 'image-targets'),
          to: path.join(distPath, 'image-targets'),
          noErrorOnMissing: true,
        },
        {
          from: path.join(srcPath, 'concentric.html'),
          to: distPath,
          noErrorOnMissing: true,
        },
        {
          from: path.join(rootPath, 'test.html'),
          to: distPath,
          noErrorOnMissing: true,
        },
      ],
    }),
  ],
  resolve: {extensions: ['.ts', '.js']},
  module: {
    rules: [
      makeJsLoader(),
      makeTsLoader(),
      makeCssLoader(),
      makeSassLoader(),
      makeAssetLoader(),
      makeDefaultHtmlLoader(),
      {
        test: /three\/.*\.js$/,
        type: 'javascript/esm',
      },
    ],
  },
  mode: 'production',
  context: srcPath,
  devServer: {
    static: [
      { directory: rootPath },
      { directory: srcPath },
    ],
    open: false,
    compress: true,
    hot: true,
    liveReload: false,
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
    client: {
      overlay: {
        warnings: false,
        errors: true,
      },
    },
  },
}

module.exports = config
