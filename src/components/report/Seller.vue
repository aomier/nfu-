<template>
  <div class="com-container">
    <div class="com-chart" ref="sellerRef"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getThemeValue } from 'utils/theme_utils'

export default {
  // 商家销售统计
  name: 'Seller',
  props: {
    analysisData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      // echarts 实例对象
      chartInstance: null,
      // 服务器返回的数据
      allData: null,
      // 当前显示的页数
      curretnPage: 1,
      // 总页数
      totalPage: 0,
      // 定时器标识
      timerId: null,
      // 当鼠标移入axis(坐标轴)时展示 底层的背景色
      PointerColor: this.axisPointerColor,
      originalChartData: null,
      isAnalysisMode: false
    }
  },
  created() {
    // this.$socket.registerCallBack('sellerData', this.getData)
  },
  computed: {
    ...mapState(['theme']),
    axisPointerColor() {
      return getThemeValue(this.theme).sellerAxisPointerColor
    },
  },
  watch: {
    theme() {
      // 销毁当前的图表
      this.chartInstance.dispose()
      // 以最新主题初始化图表对象
      this.initChart()
      // 屏幕适配
      this.screenAdapter()
      // 渲染数据
      this.updateChart()
    },
  },
  mounted() {
    // 由于初始化 使用到了DOM元素，因此需要在 mounted生命周期内调用
    this.initChart()
    this.getData()
    // this.$socket.send({
    //   action: 'getData',
    //   socketType: 'sellerData',
    //   chartName: 'seller',
    //   value: '',
    // })
    // 在界面加载完成时，主动对屏幕进行适配
    this.screenAdapter()
    window.addEventListener('resize', this.screenAdapter)
  },
  // 实例销毁后触发
  destroyed() {
    clearInterval(this.timeID)
    // 在组件销毁的时候，把监听器取消掉
    window.removeEventListener('resize', this.screenAdapter)
    // this.$socket.unRegisterCallBack('sellerData')
  },
  methods: {
    // 初始化 echartsInstance 对象
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.sellerRef, this.theme)
      // 对图表初始化的配置
      const initOption = {
        title: {
          text: '▎商家销售统计',
          left: 20,
          top: 20,
        },
        grid: {
          top: '20%',
          left: '3%',
          right: '6%',
          bottom: '3%',
          // 默认grid不包含坐标轴文字，改为true
          containLabel: true,
        },
        xAxis: {
          type: 'value',
        },
        yAxis: {
          type: 'category',
        },
        tooltip: {
          // 当鼠标移入axis(坐标轴)时展示 底层的背景色
          trigger: 'axis',
          axisPointer: {
            // 展示的类型是线条类型
            type: 'line',
            lineStyle: {
              color: this.axisPointerColor,
            },
            // 相等于 z-index 将层级调低
            z: 0,
          },
        },
        series: [
          {
            type: 'bar',
            label: {
              show: true,
              position: 'right',
              textStyle: {
                color: 'white',
              },
            },
            // 每一个柱的样式
            itemStyle: {
              // new 出 echarts 全局对象的一个线性渐变方法
              // 指明方向(第四象限坐标轴),不同百分比之下颜色的值
              color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                // 0% 状态时的颜色
                { offset: 0, color: '#5052EE' },
                // 100% 的颜色
                { offset: 1, color: '#AB6EE5' },
              ]),
            },
          },
        ],
      }

      this.chartInstance.setOption(initOption)

      // 对图表进行鼠标事件的监听
      this.chartInstance.on('mouseover', () => {
        this.timerId && clearInterval(this.timerId)
      })
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },
    // 获取服务器数据
    async getData() {
      // http://101.34.160.195:8888/api/seller
      const { data: res } = await this.$http.get('/seller')

      this.allData = res
      // 对数组排序 从小到大进行排序
      this.allData.sort((a, b) => b.value - a.value)
      // 每五个元素显示一页 计算出总页数
      this.totalPage = Math.ceil(this.allData.length / 5)

      // 开始第一次渲染
      this.updateChart()
      // 开启定时器 开始动态渲染
      this.startInterval()
    },
    // 更新图表
    updateChart() {
      // 动态从数组中取出5条数据
      const start = (this.curretnPage - 1) * 5
      const end = this.curretnPage * 5
      const showData = this.allData.slice(start, end)

      // y轴上的数据
      const sellerNames = showData.map(item => item.name)
      // x 轴上的数据
      const sellerValues = showData.map(item => item.value)

      // 当拿到数据后，准备数据的配置项
      const dataOption = {
        yAxis: {
          data: sellerNames,
        },
        series: [
          {
            data: sellerValues,
          },
        ],
      }

      // 设置数据
      this.chartInstance.setOption(dataOption)
    },
    // 开启动态渲染的定时器
    startInterval() {
      // 一般使用定时器都有一个保险操作,先关闭再开启
      this.timerId && clearInterval(this.timerId)

      this.timerId = setInterval(() => {
        this.curretnPage++
        // 当超出最大页数时,回滚到第一页
        if (this.curretnPage > this.totalPage) this.curretnPage = 1

        this.updateChart()
      }, 3000)
    },
    // 当浏览器窗口大小发生变化，完成屏幕适配
    screenAdapter() {
      const titleFontSize = (this.$refs.sellerRef.offsetWidth / 100) * 3.6
      // 浏览器分辨率大小相关的配置项
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        tooltip: {
          axisPointer: {
            lineStyle: {
              width: titleFontSize,
            },
          },
        },
        series: [
          {
            barWidth: titleFontSize,
            itemStyle: {
              barBorderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0],
            },
          },
        ],
      }
      this.chartInstance.setOption(adapterOption)
      // 手动调用图表的 resize 才能产生效果
      this.chartInstance.resize()
    },
    getAllData() {
      return {
        chartOptions: { ...this.chartOptions },
        allData: [...this.allData]
      }
    },
    updateWithAnalysisData(analysisConfig) {
      this.isAnalysisMode = true
      
      // 转换数据格式为地图需要的格式
      const mapData = analysisConfig.data.map(item => ({
        name: this.getCityNameForProfit(item.name),
        value: item.value
      }))
      
      const newOptions = {
        title: {
          text: analysisConfig.title,
          left: 20,
          top: 20,
          textStyle: {
            color: getThemeValue(this.theme).titleColor
          }
        },
        series: [
          {
            ...this.chartOptions.series[0],
            data: mapData
          }
        ]
      }
      
      this.chartInstance.setOption(newOptions, true)
    },
    getCityNameForProfit(category) {
      // 将品类映射到省份/城市
      const mapping = {
        '美妆保健': '北京',
        '手表': '上海',
        '宠物': '广东',
        '女鞋': '浙江',
        '游戏电玩': '江苏',
        '女包': '四川',
        '家居生活': '湖北',
        '运动户外': '陕西',
        '男装': '江苏',
        '食品饮料': '天津'
      }
      return mapping[category] || '其他'
    },
    restoreOriginalData(originalData) {
      this.isAnalysisMode = false
      
      if (originalData && originalData.chartOptions) {
        this.chartInstance.setOption(originalData.chartOptions, true)
      }
    }
  },
}
</script>

<style lang="less" scoped></style>
