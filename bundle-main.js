const webpack = require('webpack');
const path = require('path');
const Config = require('webpack-chain');

const config = new Config();
config
  .mode('development')
  .target('electron-main')
  .node.set('__dirname', false)
  .set('__filename', false);

config.externals({
  'iohook': 'commonjs iohook',
  'shortcut-capture': 'commonjs shortcut-capture',
  'active-win': 'commonjs active-win',
  '@nut-tree/nut-js': 'commonjs @nut-tree/nut-js'
});

config.output
  .path(path.resolve(__dirname, 'dist_electron'))
  .filename('index.js');

config.plugin('define').use(webpack.DefinePlugin, [
  {
    'process.env.NODE_ENV': JSON.stringify('development'),
    'process.env.WEBPACK_DEV_SERVER_URL': JSON.stringify('http://localhost:8080'),
    'process.env.IS_TEST': JSON.stringify(''),
    __static: JSON.stringify(path.resolve(__dirname, 'public')),
    WEBPACK_DEV_SERVER_URL: JSON.stringify('http://localhost:8080'),
    NODE_MODULES_PATH: JSON.stringify(path.resolve(__dirname, 'node_modules'))
  }
]);

config.entry('index').add(path.resolve(__dirname, 'src/background.ts'));

config.resolve.alias.set('@', path.resolve(__dirname, 'src'));

config.resolve.extensions.merge(['.js', '.ts']);

config.module
  .rule('ts')
  .test(/\.ts$/)
  .use('ts-loader')
  .loader('ts-loader')
  .options({ transpileOnly: true });

config.module
  .rule('compile-opentranslate')
  .test(/\.js$/)
  .include.add(/node_modules[\\/]@opentranslate/)
  .add(/node_modules[\\/]@opentranslate2/)
  .end()
  .use('babel-loader')
  .loader('babel-loader')
  .options({
    presets: [
      [
        require.resolve('@vue/cli-plugin-babel/preset'),
        { targets: { node: 'current' } }
      ]
    ],
    plugins: [
      require.resolve('@babel/plugin-proposal-class-properties')
    ]
  });

const compiler = webpack(config.toConfig());
compiler.run((err, stats) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  if (stats.hasErrors()) {
    console.error(stats.toString({ colors: true }));
    process.exit(1);
  }
  console.log('Main process bundled successfully!');
});
