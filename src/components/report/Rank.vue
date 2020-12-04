<template>
  <div class="com-container">
    <div class="com-chart" ref="rankRef"></div>
  </div>
</template>

<script>
export default {
  name: 'Rank',
  data() {
    return {
      // 图表的实例对象
      chartInstance: null,
      // 从服务器中获取的所有数据
      allData: null,
    }
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
      this.chartInstance = this.$echarts.init(this.$refs.rankRef, 'chalk')
      const initOption = {
        title: {
          text: '▎地区销售排行',
          left: 20,
          top: 20,
        },
        grid: {
          top: '40%',
          left: '5%',
          right: '5%',
          bottom: '5%',
          // 把x轴和y轴纳入 grid
          containLabel: true,
        },
        tooltip: {
          show: true,
        },
        xAxis: {
          type: 'category',
        },
        yAxis: {
          value: 'value',
        },
        series: [
          {
            type: 'bar',
          },
        ],
      }
      this.chartInstance.setOption(initOption)
    },
    // 发送请求，获取数据
    async getData() {
      const { data: res } = await this.$http.get('/rank')
      this.allData = res
      // 对数据进行排序(大到小)
      this.allData.sort((a, b) => b.value - a.value)

      console.log(this.allData)
      this.updateChart()
    },
    // 更新图表配置项
    updateChart() {
      // 渐变色数组
      const colorArr = [
        ['#0BA82C', '#4FF778'],
        ['#2E72BF', '#23E5E5'],
        ['#5052EE', '#AB6EE5'],
      ]
      // const colorArr = [
      //   ['#b8e994', '#079992'],
      //   ['#82ccdd', '#0a3d62'],
      //   ['#f8c291', '#b71540'],
      // ]
      // 所有省份组成的数组
      const provinceInfo = this.allData.map(item => item.name)
      // 所有省份对应的销售金额
      const valueArr = this.allData.map(item => item.value)

      const dataOption = {
        xAxis: {
          data: provinceInfo,
        },
        series: [
          {
            data: valueArr,
            itemStyle: {
              color: arg => {
                let targetColorArr = null
                console.log(arg)

                if (arg.value > 300) {
                  targetColorArr = colorArr[0]
                } else if (arg.value > 200) {
                  targetColorArr = colorArr[1]
                } else {
                  targetColorArr = colorArr[2]
                }

                return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  // 0%
                  { offset: 0, color: targetColorArr[0] },
                  // 100%
                  { offset: 1, color: targetColorArr[1] },
                ])
              },
            },
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
  },
}
</script>

<style lang="less" scoped>
</style>