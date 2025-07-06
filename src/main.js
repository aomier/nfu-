import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import * as echarts from 'echarts'

// 注册ECharts主题
import chalk from '@/assets/theme/chalk.json'
import vintage from '@/assets/theme/vintage.json'

echarts.registerTheme('chalk', chalk)
echarts.registerTheme('vintage', vintage)

// 修改API基础URL以匹配您的环境
axios.defaults.baseURL = 'http://localhost:8801'  // 后端API服务器
axios.defaults.timeout = 10000

// 添加请求拦截器
axios.interceptors.request.use(
  config => {
    console.log('🔄 发送请求:', config.url)
    return config
  },
  error => {
    console.error('❌ 请求错误:', error)
    return Promise.reject(error)
  }
)

// 添加响应拦截器
axios.interceptors.response.use(
  response => {
    console.log('✅ 收到响应:', response.data)
    return response
  },
  error => {
    console.error('❌ 响应错误:', error)
    return Promise.reject(error)
  }
)

Vue.prototype.$http = axios
Vue.prototype.$echarts = echarts
window.echarts = echarts

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')