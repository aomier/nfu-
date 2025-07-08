module.exports = {
  publicPath: '/vue2/data-view', // 根据情况自行修改
  publicPath: '/',
  outputDir: 'dist',
  devServer: {
    port: 8999, //端口号
    open: true, //自动打开浏览器
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/api': '/api'
        },
        onProxyReq: function(proxyReq, req, res) {
          console.log('Vue代理请求:', req.method, req.url);
        },
        onError: function(err, req, res) {
          console.error('Vue代理错误:', err);
        }
      }
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        components: '@/components',
        content: '@/components/content',
        common: '@/components/common',
        assets: '@/assets',
        network: '@/network',
        views: '@/views',
        utils: '@/utils',
      },
    },
  },
  chainWebpack: config => {
    // 发布模式
    config.when(process.env.NODE_ENV === 'production', cofnig => {
      // 根据当前是什么模式 来判断使用那个 入口文件
      config.entry('app').clear().add('./src/main-prod.js')

      //  打包时排除指定包 手动添加 CDN
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
      })
      // 在 public下的 index.html 中可以通过 以下命令拿到当前设置的值
      // <%= htmlWebpackPlugin.options.isProd ? '' : 'dev-'%>
      config.plugin('html').tap(args => {
        args[0].isProd = true
        return args
      })
    })

    // 开发模式
    config.when(process.env.NODE_ENV === 'development', cofnig => {
      config.plugin('html').tap(args => {
        args[0].isProd = false
        return args
      })
      config.entry('app').clear().add('./src/main-dev.js')
    })
  },
}
