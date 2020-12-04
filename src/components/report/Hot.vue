<template>
  <div class="com-container">
    <div class="com-chart" ref="hotRef"></div>
    <i class="el-icon-arrow-left icon-left" @click="toLeft"></i>
    <i class="el-icon-arrow-right icon-right" @click="toRight"></i>
    <span class="cate-name">{{ cateName }}</span>
  </div>
</template>

<script>
export default {
  name: 'Trend',
  data() {
    return {
      // 图表的实例对象
      chartInstance: null,
      // 从服务器中获取的所有数据
      allData: null,
      // 当前显示的一级分类数据类型
      currentIndex: 0,
    }
  },
  computed: {
    cateName() {
      if (!this.allData) return ''
      return this.allData[this.currentIndex].name
    },
  },
  mounted() {
    this.initChart()
    this.getData()
    window.addEventListener('resize', this.screenAdapter)
    // 主动触发 响应式配置
    this.screenAdapter()
  },
  destroyed() {
    window.removeEventListener('resize', this.screenAdapter)
  },
  methods: {
    // 初始化图表的方法
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.hotRef, 'chalk')
      const initOption = {
        series: [
          {
            type: 'pie',
          },
        ],
      }
      this.chartInstance.setOption(initOption)
    },
    // 发送请求，获取数据
    async getData() {
      // this.$http.get()
      // 对 addData赋值
      const { data: res } = await this.$http.get('/hotproduct')
      this.allData = res
      console.log(this.allData)
      this.updateChart()
    },
    // 更新图表配置项
    updateChart() {
      // 处理数据
      const legenDateArr = this.allData[this.currentIndex].children.map(item => item.name)
      const seriesDataArr = this.allData[this.currentIndex].children.map(item => {
        return {
          name: item.name,
          value: item.value,
        }
      })
      console.log(seriesDataArr)
      const dataOption = {
        legend: {
          data: legenDateArr,
        },
        series: [
          {
            data: seriesDataArr,
          },
        ],
      }
      this.chartInstance.setOption(dataOption)
    },
    // 不同分辨率的响应式
    screenAdapter() {
      const adapterOption = {}
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
    // 点击左侧按钮
    toLeft() {
      this.currentIndex--
      // 已到达最左边
      if (this.currentIndex < 0) this.currentIndex = this.allData.length - 1
      this.updateChart()
    },
    toRight() {
      this.currentIndex++
      // 已到达最右边
      if (this.currentIndex > this.allData.length - 1) this.currentIndex = 0
      this.updateChart()
    },
  },
}
</script>

<style lang="less" scoped>
.com-container {
  i {
    z-index: 999;
    position: absolute;
    transform: translateY(-50%);
    color: white;
    top: 50%;
    cursor: pointer;
  }
  i.icon-left {
    left: 10%;
  }
  i.icon-right {
    right: 10%;
  }
  .cate-name {
    position: absolute;
    right: 10%;
    bottom: 20px;
    z-index: 999;
    color: white;
  }
}
</style>