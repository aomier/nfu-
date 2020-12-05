<template>
  <div class="com-container">
    <div class="com-chart" ref="hotRef"></div>
    <i class="el-icon-arrow-left icon-left" @click="toLeft" :style="{ fontSize: FontSize + 'px' }"></i>
    <i class="el-icon-arrow-right icon-right" @click="toRight" :style="{ fontSize: FontSize + 'px' }"></i>
    <span class="cate-name" :style="{ fontSize: FontSize / 1.5 + 'px' }">{{ cateName }}</span>
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
      // 字体响应式大小
      titleFontSize: null,
    }
  },
  computed: {
    cateName() {
      if (!this.allData) return ''
      return this.allData[this.currentIndex].name
    },
    FontSize() {
      if (!this.titleFontSize) return ''
      return this.titleFontSize
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
        title: {
          text: '▎热销商品占比',
          left: 20,
          top: 20,
        },
        legend: {
          top: '12%',
          // 图标类型 圆形
          icon: 'circle',
        },
        tooltip: {
          show: true,
          // formatter:'hhh'
          formatter: arg => {
            // console.log('arg: ', arg)
            // 拿到三级分类的数据
            const thirdCategory = arg.data.children
            // 计算所有三级分类的数值总和，才能计算出百分比
            let total = 0
            thirdCategory.forEach(item => {
              total += item.value
            })
            // 显示的文本
            let showStr = ''
            thirdCategory.forEach(item => {
              showStr += `
                ${item.name}：${this.floatNumber((item.value / total) * 100, 3)}% <br/>
              `
            })
            return showStr
          },
        },
        series: [
          {
            type: 'pie',
            label: {
              show: true,
            },
            // 高亮状态下的样式
            emphasis: {
              labelLine: {
                // 连接文字的线条
                show: true,
              },
            },
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
          children: item.children,
        }
      })
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
      this.titleFontSize = (this.$refs.hotRef.offsetWidth / 100) * 3.6
      console.log('titleFontSize: ', this.titleFontSize)

      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize / 1.2,
          },
        },
        legend: {
          itemWidth: this.titleFontSize / 2,
          itemHeight: this.titleFontSize / 2,
          // 图例的间隔
          itemGap: this.titleFontSize / 2,
          textStyle: {
            fontSize: this.titleFontSize / 2,
          },
        },
        series: [
          {
            // 饼图的大小 半径
            radius: this.titleFontSize * 4.5,
            // 控制饼图的位置 x,y
            center: ['50%', '60%'],
          },
        ],
      }
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
    // 点击右侧按钮
    toRight() {
      this.currentIndex++
      // 已到达最右边
      if (this.currentIndex > this.allData.length - 1) this.currentIndex = 0
      this.updateChart()
    },
    // 保留小数位数
    // retain 保持、保留
    floatNumber(number, retain) {
      if (!number) return ''
      let str = number.toString()
      let index = str.indexOf('.')
      if (index === -1) return number

      return str.slice(0, index + retain + 1)
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