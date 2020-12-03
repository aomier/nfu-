import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'

// 配置默认路径
axios.defaults.baseUrl = 'http://127.0.0.1:8888/api'
Vue.prototype.$http = axios

// echarts 已在 public/index.html 中通过 script引入
Vue.prototype.$echarts = window.echarts

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
