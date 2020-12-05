import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import ElementUI from 'element-ui';

// 引入elementui
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

// 引入全局样式文件
import './assets/css/global.less'

// 引入字体文件
import './assets/font/iconfont.css'

// 引入 socket_service
import SocketService from './utils/socket_service'
// 对服务端进行 webSocket的连接
SocketService.Instance.connect()
Vue.prototype.$socket = SocketService.Instance

// axios 配置接口默认路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/'
Vue.prototype.$http = axios

// echarts 已在 public/index.html 中通过 script引入
Vue.prototype.$echarts = window.echarts

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
