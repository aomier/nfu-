<template>
  <div class="com-container">
    <div class="com-chart" ref="trend_ref"></div>
  </div>
</template>

<script>
export default {
  name: 'Trend',
  data() {
    return {
      chartInstance: null,
      allData: null
    }
  },
  
  mounted() {
    console.log('📈 Trend组件已挂载')
    this.initChart()
    this.getData()
    window.addEventListener('resize', this.screenAdapter)
  },
  
  destroyed() {
    window.removeEventListener('resize', this.screenAdapter)
    if (this.chartInstance) {
      this.chartInstance.dispose()
    }
  },
  
  methods: {
    initChart() {
      // 检查ECharts是否可用
      if (!this.$echarts && !window.echarts) {
        console.error('❌ ECharts未正确加载 - Trend组件')
        return
      }
      
      const echarts = this.$echarts || window.echarts
      this.chartInstance = echarts.init(this.$refs.trend_ref, 'chalk')
      
      // 设置基础配置
      const initOption = {
        title: {
          text: '商家销售趋势',
          left: 'center',
          textStyle: {
            color: '#fff'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: []
        },
        yAxis: {
          type: 'value'
        },
        series: []
      }
      
      this.chartInstance.setOption(initOption)
      console.log('✅ Trend图表初始化完成')
    },
    
    async getData() {
      try {
        console.log('📡 获取Trend数据...')
        
        // 模拟数据 - 您可以替换为实际的API调用
        const mockData = {
          common: {
            month: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
          },
          type: {
            map: {
              '销售额': [3200, 3800, 4100, 4600, 4200, 3900, 4300, 4800, 4500, 4700, 5100, 5400],
              '利润': [1200, 1400, 1600, 1800, 1650, 1500, 1700, 1900, 1750, 1850, 2000, 2100],
              '用户数': [820, 932, 901, 934, 1290, 1330, 1320, 1400, 1380, 1450, 1500, 1600]
            }
          }
        }
        
        this.allData = mockData
        this.updateChart()
        
      } catch (error) {
        console.error('❌ Trend数据获取失败:', error)
        
        // 使用默认数据
        this.allData = {
          common: {
            month: ['1月', '2月', '3月', '5月', '6月']
          },
          type: {
            map: {
              '销售额': [3200, 3800, 4100, 4600, 4200, 3900],
              '利润': [1200, 1400, 1600, 1800, 1650, 1500]
            }
          }
        }
        this.updateChart()
      }
    },
    
    updateChart() {
      if (!this.chartInstance || !this.allData) return
      
      console.log('🎨 更新Trend图表...')
      
      const dataOption = {
        xAxis: {
          data: this.allData.common.month
        },
        legend: {
          data: Object.keys(this.allData.type.map),
          textStyle: {
            color: '#fff'
          }
        },
        series: []
      }
      
      // 构建系列数据
      Object.keys(this.allData.type.map).forEach(key => {
        dataOption.series.push({
          name: key,
          type: 'line',
          data: this.allData.type.map[key],
          smooth: true,
          lineStyle: {
            width: 3
          },
          areaStyle: {
            opacity: 0.3
          }
        })
      })
      
      this.chartInstance.setOption(dataOption)
      console.log('✅ Trend图表更新完成')
    },
    
    screenAdapter() {
      if (this.chartInstance) {
        this.chartInstance.resize()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.com-container {
  width: 100%;
  height: 100%;
}
.com-chart {
  width: 100%;
  height: 100%;
}
</style>
