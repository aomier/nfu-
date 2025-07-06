import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'  // 🔍 检查这个文件是否存在

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home  // 🔍 确保这个组件存在
  },
  {
    path: '/prophet',
    name: 'ProphetForecast', 
    component: () => import('../views/ProphetForecast.vue'),
    meta: {
      title: 'Prophet时间序列预测'
    }
  },
  {
    path: '/kmeans',
    name: 'KmeansResults',
    component: () => import('../views/KmeansResults.vue'),
    meta: {
      title: 'K聚类分析'
    }
  },
  {
    path: '/kmeans-results',
    name: 'KmeansResultsPage',
    component: () => import('../views/KmeansResults.vue'),
    meta: {
      title: 'K聚类分析结果'
    }
  },
  {
    path: '/profit',
    name: 'Profit',
    component: () => import('../views/AnalysisResults.vue'),
    meta: {
      title: '利润分析结果'
    }
  },
  {
    path: '/heatmap',
    name: 'HeatmapAnalysis',
    component: () => import('../views/HeatmapAnalysis.vue'),
    meta: {
      title: '热力图相关性分析',
      description: '深度挖掘业务因素间的关联关系'
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router