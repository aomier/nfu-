module.exports = {
  devServer: {
    port: 8999, //端口号
    open: true, //自动打开浏览器
  },
  configureWebpack: {
    resolve: {
      alias: {
        components: "@/components",
        content: "@/components/content",
        common: "@/components/common",
        assets: "@/assets",
        network: "@/network",
        views: "@/views",
      }
    }
  },
}