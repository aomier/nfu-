// 商家销量统计的横向柱状图
<template>
  <div class="com-container">
    <div class="com-chart" ref="sellerRef"></div>
  </div>
</template>

<script>
export default {
  name: "Seller",
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
    };
  },
  mounted() {
    // 由于初始化 使用到了DOM元素，因此需要在 mounted生命周期内调用
    this.initChart();
    this.getData();
  },
  // 实例销毁后触发
  destroyed() {
    clearInterval(this.timeID);
  },
  methods: {
    // 初始化 echartsInstance 对象
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.sellerRef);

      // 对图表进行鼠标事件的监听
      this.chartInstance.on("mouseover", () => {
        this.timerId && clearInterval(this.timerId);
      });
      this.chartInstance.on("mouseout", () => {
        this.startInterval()
      });
    },
    // 获取服务器数据
    async getData() {
      // http://127.0.0.1:8888/api/seller
      const { data: res } = await this.$http.get("seller");
      console.log("res: ", res);

      this.allData = res;
      // 对数组排序 从小到大进行排序
      this.allData.sort((a, b) => a.value - b.value);
      // 每五个元素显示一页 计算出总页数
      this.totalPage = Math.ceil(this.allData.length / 5);

      // 开始第一次渲染
      this.updateChart();
      // 开启定时器 开始动态渲染
      this.startInterval();
    },
    // 更新图表
    updateChart() {
      // 动态从数组中取出5条数据
      const start = (this.curretnPage - 1) * 5;
      const end = this.curretnPage * 5;
      const showData = this.allData.slice(start, end);
      console.log("showData: ", showData);

      // y轴上的数据
      const sellerNames = showData.map((item) => item.name);
      // x 轴上的数据
      const sellerValues = showData.map((item) => item.value);

      const option = {
        xAxis: {
          type: "value",
        },
        yAxis: {
          type: "category",
          data: sellerNames,
        },
        series: [
          {
            type: "bar",
            data: sellerValues,
          },
        ],
      };
      // 设置数据
      this.chartInstance.setOption(option);
    },
    // 开启动态渲染的定时器
    startInterval() {
      // 一般使用定时器都有一个保险操作,先关闭再开启
      this.timerId && clearInterval(this.timerId);

      this.timerId = setInterval(() => {
        this.curretnPage++;
        // 当超出最大页数时,回滚到第一页
        if (this.curretnPage > this.totalPage) this.curretnPage = 1;

        this.updateChart();
      }, 3000);
    },
  },
};
</script>

<style lang="less" scoped>
</style>