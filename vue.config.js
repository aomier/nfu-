module.exports = {
  // Set the public path to the root for Vercel deployment
  // This ensures that assets are loaded correctly.
  publicPath: '/',

  // Use the default output directory 'dist', which Vercel expects.
  // We can comment this out or remove it to use the default.
  // outputDir: 'dist',

  devServer: {
    port: 8999, // Port for local development
    open: true, // Automatically open the browser
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
    // Production mode settings
    config.when(process.env.NODE_ENV === 'production', cofnig => {
      // Use the production entry point
      config.entry('app').clear().add('./src/main-prod.js')

      // Exclude packages from the bundle to be loaded from a CDN
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
      })

      // Set a flag for the production environment in index.html
      config.plugin('html').tap(args => {
        args[0].isProd = true
        return args
      })
    })

    // Development mode settings
    config.when(process.env.NODE_ENV === 'development', cofnig => {
      // Set a flag for the development environment in index.html
      config.plugin('html').tap(args => {
        args[0].isProd = false
        return args
      })
      // Use the development entry point
      config.entry('app').clear().add('./src/main-dev.js')
    })
  },
}
