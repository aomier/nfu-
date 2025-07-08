<template>
<!-- filepath: c:\Users\Mcola.Tech\不改动版本\data-view\src\views\ProphetForecast.vue -->
  <div class="com-container" :style="containerStyle">
    <!-- 头部区域 -->
    <div class="header">
      <div class="header-left">
        <div class="title-box">
          <i class="el-icon-time"></i>
          <h2>时间序列预测分析</h2>
        </div>
        <div class="data-overview">
          <span>预测周期: {{ prophetData.model_info?.forecast_periods || 12 }} 个月</span>
          <span>准确率: {{ formatAccuracy(prophetData.model_performance?.accuracy || 91.5) }}%</span>
          <span>增长率: {{ formatGrowthRate(prophetData.trend_analysis?.growth_rate || 16.87) }}</span>
          <span>分析时间: {{ formatTime(prophetData.timestamp) }}</span>
        </div>
      </div>
      <div class="header-right">
        <img v-show="theme == 'chalk'" src="~@/assets/images/qiehuan_dark.png" class="qiehuan" @click="handleChangeTheme" alt="切换主题" title="切换主题" />
        <img v-show="theme != 'chalk'" src="~@/assets/images/qiehuan_light.png" class="qiehuan" @click="handleChangeTheme" alt="切换主题" title="切换主题" />
        <span class="datetime">{{ systemDateTime }}</span>
        <el-button icon="el-icon-back" size="small" type="text" @click="goBack">返回</el-button>
      </div>
    </div>
    
    <!-- 主要内容区域 - 网格布局 -->
    <div class="main-grid-container">
      <!-- 上半部分 - 左侧 - 预测趋势图 -->
      <div class="chart-panel forecast-trend-panel">
        <div class="panel-header">
          <h3>销量预测趋势</h3>
          <div class="panel-actions">
            <i class="el-icon-refresh-right" @click="refreshData" title="刷新数据"></i>
            <i :class="fullScreenStatus.forecast ? 'el-icon-minus' : 'el-icon-full-screen'" 
               @click="changeSize('forecast')" title="全屏切换"></i>
          </div>
        </div>
        <div class="chart-wrapper" :class="{ fullscreen: fullScreenStatus.forecast }">
          <div class="forecast-chart" ref="forecastChart"></div>
        </div>
      </div>
      
      <!-- 上半部分 - 右侧 - 关键指标 -->
      <div class="chart-panel key-metrics-panel">
        <div class="panel-header">
          <h3>关键预测指标</h3>
          <div class="panel-actions">
            <i :class="fullScreenStatus.metrics ? 'el-icon-minus' : 'el-icon-full-screen'" 
               @click="changeSize('metrics')" title="全屏切换"></i>
          </div>
        </div>
        <div class="chart-wrapper" :class="{ fullscreen: fullScreenStatus.metrics }">
          <div class="metrics-container">
            <div class="metric-card">
              <div class="card-icon">
                <i class="el-icon-data-board"></i>
              </div>
              <div class="card-content">
                <div class="metric-label">年度预测总量</div>
                <div class="metric-value">{{ formatNumber(calculateTotalForecast()) }}</div>
                <div class="metric-change positive">{{ formatGrowthRate(prophetData.trend_analysis?.growth_rate || 16.87) }}</div>
              </div>
            </div>
            
            <div class="metric-card">
              <div class="card-icon">
                <i class="el-icon-date"></i>
              </div>
              <div class="card-content">
                <div class="metric-label">月均销量</div>
                <div class="metric-value">{{ formatNumber(calculateAvgMonthly()) }}</div>
                <div class="metric-change">预测值</div>
              </div>
            </div>
            
            <div class="metric-card">
              <div class="card-icon">
                <i class="el-icon-data-analysis"></i>
              </div>
              <div class="card-content">
                <div class="metric-label">模型误差率</div>
                <div class="metric-value">{{ prophetData.model_performance?.mape || 8.5 }}%</div>
                <div class="metric-change">MAPE</div>
              </div>
            </div>
            
            <div class="metric-card">
              <div class="card-icon">
                <i class="el-icon-success"></i>
              </div>
              <div class="card-content">
                <div class="metric-label">预测准确率</div>
                <div class="metric-value">{{ formatAccuracy(prophetData.model_performance?.accuracy || 91.5) }}%</div>
                <div class="metric-change positive">优秀</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 下半部分 - 左侧 - 季节性分析 -->
      <div class="chart-panel seasonal-panel">
        <div class="panel-header">
          <h3>季节性模式分析</h3>
          <div class="panel-actions">
            <i class="el-icon-refresh-right" @click="refreshData" title="刷新数据"></i>
            <i :class="fullScreenStatus.seasonal ? 'el-icon-minus' : 'el-icon-full-screen'" 
               @click="changeSize('seasonal')" title="全屏切换"></i>
          </div>
        </div>
        <div class="chart-wrapper" :class="{ fullscreen: fullScreenStatus.seasonal }">
          <div class="seasonal-chart" ref="seasonalChart"></div>
        </div>
      </div>
      
      <!-- 下半部分 - 右侧 - 洞察与建议 -->
      <div class="chart-panel insights-panel">
        <div class="panel-header">
          <h3>业务洞察与建议</h3>
          <div class="panel-actions">
            <i :class="fullScreenStatus.insights ? 'el-icon-minus' : 'el-icon-full-screen'" 
               @click="changeSize('insights')" title="全屏切换"></i>
          </div>
        </div>
        <div class="chart-wrapper" :class="{ fullscreen: fullScreenStatus.insights }">
          <div class="insights-container">
            <!-- 标签切换 -->
            <div class="insights-tabs">
              <div class="tab" :class="{ active: activeTab === 'insights' }" @click="activeTab = 'insights'">
                <i class="el-icon-data-analysis"></i> 关键洞察
              </div>
              <div class="tab" :class="{ active: activeTab === 'recommendations' }" @click="activeTab = 'recommendations'">
                <i class="el-icon-s-opportunity"></i> 战略建议
              </div>
            </div>
            
            <!-- 内容区域 -->
            <div class="insights-content">
              <!-- 洞察内容 -->
              <div v-if="activeTab === 'insights'" class="insights-list">
                <div v-for="(insight, index) in prophetData.business_insights || []" :key="index" class="insight-item">
                  <div class="insight-icon">
                    <i class="el-icon-light-rain"></i>
                  </div>
                  <div class="insight-text">{{ insight }}</div>
                </div>
              </div>
              
              <!-- 建议内容 -->
              <div v-if="activeTab === 'recommendations'" class="recommendations-list">
                <div v-for="(rec, index) in prophetData.recommendations || []" :key="index" class="recommendation-item">
                  <div class="rec-header">
                    <span class="rec-category">{{ rec.category }}</span>
                    <span class="rec-priority" :class="`priority-${rec.priority}`">{{ rec.priority }}</span>
                  </div>
                  <div class="rec-content">{{ rec.suggestion || rec.recommendation }}</div>
                  <div class="rec-meta">
                    <span class="rec-timeline">{{ rec.timeline || rec.timeframe }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 表格查看按钮 -->
    <div class="show-table-btn" @click="showTableModal = true">
      <i class="el-icon-s-grid"></i>
      查看月度预测数据
    </div>
    
    <!-- 月度预测数据表格弹窗 -->
    <el-dialog
      title="月度预测详情"
      :visible.sync="showTableModal"
      width="80%"
      custom-class="forecast-table-dialog"
      :close-on-click-modal="false"
    >
      <div class="table-wrapper">
        <el-table
          :data="prophetData.forecast_data || []"
          stripe
          style="width: 100%"
          :default-sort="{prop: 'date', order: 'ascending'}"
          empty-text="暂无预测数据"
          v-loading="loading"
        >
          <el-table-column prop="date" label="月份" width="120" fixed="left">
            <template slot-scope="scope">
              <el-tag type="primary">
                {{ formatMonthName(scope.row.date) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="predicted_sales" label="预测销量" width="120" sortable>
            <template slot-scope="scope">
              <span class="forecast-value">{{ formatNumber(scope.row.predicted_sales) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column label="置信区间" width="200">
            <template slot-scope="scope">
              <div class="confidence-range">
                <span class="range-text">
                  {{ formatNumber(scope.row.lower_bound) }} ~ {{ formatNumber(scope.row.upper_bound) }}
                </span>
                <el-progress 
                  :percentage="getConfidencePercentage(scope.row)" 
                  :stroke-width="6"
                  :show-text="false"
                  :color="getConfidenceColor(scope.row.confidence)"
                ></el-progress>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="trend" label="趋势值" width="100" sortable>
            <template slot-scope="scope">
              <span class="trend-value">{{ formatNumber(scope.row.trend) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="seasonal" label="季节性" width="100">
            <template slot-scope="scope">
              <span :class="getSeasonalClass(scope.row.seasonal)">
                {{ formatNumber(scope.row.seasonal, true) }}
              </span>
            </template>
          </el-table-column>
          
          <el-table-column prop="confidence" label="置信度" width="100">
            <template slot-scope="scope">
              <el-tag :type="getConfidenceTagType(scope.row.confidence)">
                {{ Math.round(scope.row.confidence) }}%
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showTableModal = false">关闭</el-button>
        <el-button type="primary" @click="exportReport">导出报告</el-button>
      </span>
    </el-dialog>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载预测分析数据...</p>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { mapState } from 'vuex'
import { getThemeValue } from '@/utils/theme_utils'

export default {
  name: 'ProphetForecast',
  data() {
    return {
      prophetData: {
        timestamp: '',
        model_info: {},
        model_performance: {},
        forecast_data: [],
        historical_data: [],
        business_insights: [],
        recommendations: [],
        trend_analysis: {}
      },
      loading: false,
      forecastChartInstance: null,
      seasonalChartInstance: null,
      // 系统时间相关
      systemDateTime: null,
      timerID: null,
      // 全屏状态控制
      fullScreenStatus: {
        forecast: false,
        metrics: false,
        seasonal: false,
        insights: false
      },
      // 标签页切换
      activeTab: 'insights',
      // 表格显示控制
      showTableModal: false,
      // 图表颜色
      chartColors: [
        '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', 
        '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'
      ],
      titleFontSize: null
    }
  },
  
  computed: {
    ...mapState(['theme']),
    containerStyle() {
      return {
        backgroundColor: getThemeValue(this.theme).backgroundColor || '#0A1929',
        color: getThemeValue(this.theme).titleColor || '#fff',
      }
    },
    titleColor() {
      return {
        color: getThemeValue(this.theme).titleColor,
      }
    },
    themeStyle() {
      if (!this.titleFontSize) {
        return { color: getThemeValue(this.theme).titleColor }
      }
      return {
        fontSize: this.titleFontSize + 'px',
        color: getThemeValue(this.theme).titleColor,
      }
    },
  },
  
  mounted() {
    this.loadProphetData();
    this.currentTime();
    window.addEventListener('resize', this.handleResize);
    this.screenAdapter();
  },
  
  beforeDestroy() {
    clearInterval(this.timerID);
    window.removeEventListener('resize', this.handleResize);
    this.disposeCharts();
  },
  
  watch: {
    theme() {
      this.disposeCharts();
      this.$nextTick(() => {
        this.initCharts();
      });
    }
  },
  
  methods: {
    // 屏幕适配函数
    screenAdapter() {
      const mainEl = document.querySelector('.com-container');
      if (mainEl) {
        this.titleFontSize = (mainEl.offsetWidth / 100) * 1.6;
        
        if (this.forecastChartInstance) {
          this.forecastChartInstance.resize();
        }
        if (this.seasonalChartInstance) {
          this.seasonalChartInstance.resize();
        }
      }
    },
    
    // 窗口大小变化处理
    handleResize() {
      this.screenAdapter();
    },
    
    // 时间显示功能
    currentTime() {
      this.systemDateTime = new Date().toLocaleString();
      this.timerID && clearInterval(this.timerID);
      this.timerID = setInterval(() => {
        this.systemDateTime = new Date().toLocaleString();
      }, 1000);
    },
    
    // 主题切换
    handleChangeTheme() {
      this.$store.commit('changeTheme');
    },
    
    // 全屏切换
    changeSize(panelName) {
      this.fullScreenStatus[panelName] = !this.fullScreenStatus[panelName];
      this.$nextTick(() => {
        if (panelName === 'forecast' && this.forecastChartInstance) {
          this.forecastChartInstance.resize();
        } else if (panelName === 'seasonal' && this.seasonalChartInstance) {
          this.seasonalChartInstance.resize();
        }
      });
    },
    
    // 清理图表实例
    disposeCharts() {
      if (this.forecastChartInstance) {
        this.forecastChartInstance.dispose();
        this.forecastChartInstance = null;
      }
      if (this.seasonalChartInstance) {
        this.seasonalChartInstance.dispose();
        this.seasonalChartInstance = null;
      }
    },
    
    // 加载Prophet数据
    async loadProphetData() {
      try {
        this.loading = true;
        
        try {
          const response = await this.$http.get('/api/analysis/prophet/results');
          
          if (response.data && response.data.success && response.data.data) {
            this.prophetData = response.data.data;
          } else {
            throw new Error('API返回数据格式错误');
          }
        } catch (apiError) {
          console.log('⚠️ API请求失败，使用模拟数据:', apiError.message);
          this.prophetData = this.getMockData();
        }
        
        // 初始化图表
        this.$nextTick(() => {
          setTimeout(() => {
            this.initCharts();
            this.loading = false;
          }, 300);
        });
        
      } catch (error) {
        console.error('❌ 加载Prophet数据失败:', error);
        this.$message.error('加载Prophet数据失败: ' + error.message);
        
        this.prophetData = this.getMockData();
        
        this.$nextTick(() => {
          setTimeout(() => {
            this.initCharts();
            this.loading = false;
          }, 300);
        });
      }
    },
    
    // 获取模拟数据
    getMockData() {
      return {
        timestamp: new Date().toISOString(),
        model_info: {
          algorithm: "Facebook Prophet",
          training_period: "2022-01 到 2024-12",
          forecast_periods: 12,
          performance: {
            accuracy: 91.5,
            mape: 7.8
          }
        },
        model_performance: {
          mae: 950.5,
          rmse: 1256.7,
          mape: 7.8,
          accuracy: 91.5,
          confidence_level: 80.0
        },
        forecast_data: [
          { date: '2025-01-01', predicted_sales: 5200000, lower_bound: 4800000, upper_bound: 5600000, trend: 5000000, seasonal: 200000, confidence: 82 },
          { date: '2025-02-01', predicted_sales: 4800000, lower_bound: 4400000, upper_bound: 5200000, trend: 5050000, seasonal: -250000, confidence: 80 },
          { date: '2025-03-01', predicted_sales: 5100000, lower_bound: 4700000, upper_bound: 5500000, trend: 5100000, seasonal: 0, confidence: 81 },
          { date: '2025-04-01', predicted_sales: 5350000, lower_bound: 4950000, upper_bound: 5750000, trend: 5150000, seasonal: 200000, confidence: 83 },
          { date: '2025-05-01', predicted_sales: 5400000, lower_bound: 5000000, upper_bound: 5800000, trend: 5200000, seasonal: 200000, confidence: 84 },
          { date: '2025-06-01', predicted_sales: 5250000, lower_bound: 4850000, upper_bound: 5650000, trend: 5250000, seasonal: 0, confidence: 82 },
          { date: '2025-07-01', predicted_sales: 5300000, lower_bound: 4900000, upper_bound: 5700000, trend: 5300000, seasonal: 0, confidence: 83 },
          { date: '2025-08-01', predicted_sales: 5500000, lower_bound: 5100000, upper_bound: 5900000, trend: 5350000, seasonal: 150000, confidence: 85 },
          { date: '2025-09-01', predicted_sales: 5450000, lower_bound: 5050000, upper_bound: 5850000, trend: 5400000, seasonal: 50000, confidence: 84 },
          { date: '2025-10-01', predicted_sales: 5600000, lower_bound: 5200000, upper_bound: 6000000, trend: 5450000, seasonal: 150000, confidence: 86 },
          { date: '2025-11-01', predicted_sales: 6200000, lower_bound: 5800000, upper_bound: 6600000, trend: 5500000, seasonal: 700000, confidence: 88 },
          { date: '2025-12-01', predicted_sales: 6800000, lower_bound: 6400000, upper_bound: 7200000, trend: 5550000, seasonal: 1250000, confidence: 90 }
        ],
        historical_data: [
          { date: '2024-01-01', actual_sales: 4800000, trend: 4600000 },
          { date: '2024-02-01', actual_sales: 4500000, trend: 4650000 },
          { date: '2024-03-01', actual_sales: 4750000, trend: 4700000 },
          { date: '2024-04-01', actual_sales: 4950000, trend: 4750000 },
          { date: '2024-05-01', actual_sales: 5100000, trend: 4800000 },
          { date: '2024-06-01', actual_sales: 4900000, trend: 4850000 },
          { date: '2024-07-01', actual_sales: 5000000, trend: 4900000 },
          { date: '2024-08-01', actual_sales: 5300000, trend: 4950000 },
          { date: '2024-09-01', actual_sales: 5150000, trend: 5000000 },
          { date: '2024-10-01', actual_sales: 5400000, trend: 5050000 },
          { date: '2024-11-01', actual_sales: 5800000, trend: 5100000 },
          { date: '2024-12-01', actual_sales: 6200000, trend: 5150000 }
        ],
        trend_analysis: {
          overall_trend: "上升趋势",
          growth_rate: 16.87,
          seasonal_strength: 12.5,
          trend_strength: 5000000,
          volatility: 750000
        },
        business_insights: [
          "基于Prophet时间序列模型的高精度预测分析",
          "模型准确率达到91.5%，预测结果具有较高可信度",
          "未来12个月销量趋势呈现稳定上升态势",
          "预计年度总销量约为66.0M，同比增长16.87%",
          "11-12月为传统销售高峰期，预测销量大幅增长",
          "2月受季节性影响销量较低，建议制定促销策略",
          "8月暑期档也呈现销量上升趋势，可考虑加大营销投入"
        ],
        recommendations: [
          {
            category: "库存管理",
            suggestion: "基于预测销量调整采购计划，11-12月提前增加30%安全库存",
            priority: "高",
            timeline: "短期"
          },
          {
            category: "营销策略",
            suggestion: "在预测高峰期(11-12月、8月)加大营销投入，低谷期(2月)实施促销活动",
            priority: "高",
            timeline: "中期"
          },
          {
            category: "产能规划",
            suggestion: "根据16.87%年增长趋势扩充生产能力，确保供应链稳定",
            priority: "中",
            timeline: "长期"
          }
        ]
      }
    },
    
    // 初始化图表
    initCharts() {
      if (!this.prophetData || !this.prophetData.forecast_data) {
        return;
      }
      
      try {
        this.initForecastChart();
        this.initSeasonalChart();
      } catch (error) {
        console.error('❌ Prophet图表初始化失败:', error);
      }
    },
    
    // 初始化预测趋势图
    initForecastChart() {
      const chartContainer = this.$refs.forecastChart;
      if (!chartContainer) {
        return;
      }
      
      if (this.forecastChartInstance) {
        this.forecastChartInstance.dispose();
      }
      
      const isDark = this.theme === 'chalk';
      this.forecastChartInstance = echarts.init(chartContainer, isDark ? 'dark' : null);
      
      const forecastData = this.prophetData.forecast_data || [];
      const historicalData = this.prophetData.historical_data || [];
      
      if (forecastData.length === 0) {
        return;
      }
      
      // 处理数据
      const historicalDates = historicalData.map(item => this.formatMonthName(item.date));
      const forecastDates = forecastData.map(item => this.formatMonthName(item.date));
      const allDates = [...historicalDates, ...forecastDates];
      
      const historicalSales = historicalData.map(item => Number(item.actual_sales) || 0);
      const forecastSales = forecastData.map(item => Number(item.predicted_sales) || 0);
      
      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(10, 25, 41, 0.7)',
          borderColor: '#00BFFF',
          borderWidth: 1,
          textStyle: { color: '#fff' },
          formatter: (params) => {
            let result = `<div style="padding: 8px;"><strong>${params[0].axisValue}</strong><br/>`;
            
            params.forEach(param => {
              if (param.seriesName === '历史销量') {
                result += `<div style="margin: 4px 0;"><span style="color: ${param.color};">● 历史销量:</span> <strong>${this.formatNumber(param.value)}</strong></div>`;
              } else if (param.seriesName === '预测销量') {
                const dataIndex = param.dataIndex - historicalData.length;
                if (dataIndex >= 0 && forecastData[dataIndex]) {
                  const currentData = forecastData[dataIndex];
                  result += `
                    <div style="margin: 4px 0;"><span style="color: ${param.color};">● 预测销量:</span> <strong>${this.formatNumber(param.value)}</strong></div>
                    <div style="margin: 4px 0; font-size: 12px; color: #aaa;">置信区间: ${this.formatNumber(currentData.lower_bound)} ~ ${this.formatNumber(currentData.upper_bound)}</div>
                    <div style="margin: 4px 0; font-size: 12px; color: #aaa;">置信度: ${Math.round(currentData.confidence)}%</div>
                  `;
                }
              }
            });
            
            result += '</div>';
            return result;
          }
        },
        legend: {
          data: ['历史销量', '预测销量', '置信区间'],
          bottom: 10,
          textStyle: { color: 'rgba(255, 255, 255, 0.7)' }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '8%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: allDates,
          axisLabel: { 
            color: 'rgba(255, 255, 255, 0.7)',
            rotate: 45,
            interval: 0,
            fontSize: 11
          },
          axisLine: { lineStyle: { color: 'rgba(0, 191, 255, 0.3)' } },
          axisTick: { lineStyle: { color: 'rgba(0, 191, 255, 0.3)' } }
        },
        yAxis: {
          type: 'value',
          name: '销量',
          nameTextStyle: { color: 'rgba(255, 255, 255, 0.7)' },
          axisLabel: { 
            color: 'rgba(255, 255, 255, 0.7)',
            formatter: (value) => this.formatNumber(value)
          },
          axisLine: { lineStyle: { color: 'rgba(0, 191, 255, 0.3)' } },
          axisTick: { lineStyle: { color: 'rgba(0, 191, 255, 0.3)' } },
          splitLine: { lineStyle: { color: 'rgba(0, 191, 255, 0.1)' } }
        },
        series: [
          // 置信区间系列
          {
            name: '置信区间',
            type: 'line',
            data: [
              // 历史数据部分填充null
              ...new Array(historicalData.length).fill(null),
              // 预测部分的上界
              ...forecastData.map(item => Number(item.upper_bound) || 0)
            ],
            lineStyle: { opacity: 0 },
            symbol: 'none',
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(0, 191, 255, 0.3)' },
                { offset: 1, color: 'rgba(0, 191, 255, 0.1)' }
              ])
            },
            stack: 'confidence',
            tooltip: { show: false },
            z: 1
          },
          {
            name: '置信区间下界',
            type: 'line',
            data: [
              // 历史数据部分填充null
              ...new Array(historicalData.length).fill(null),
              // 预测部分的下界
              ...forecastData.map(item => Number(item.lower_bound) || 0)
            ],
            lineStyle: { opacity: 0 },
            symbol: 'none',
            areaStyle: {
              color: 'rgba(10, 25, 41, 0.95)' // 深色遮罩，形成区间效果
            },
            stack: 'confidence',
            tooltip: { show: false },
            z: 1
          },
          // 历史销量线
          {
            name: '历史销量',
            type: 'line',
            data: [
              ...historicalSales,
              ...new Array(forecastData.length).fill(null)
            ],
            lineStyle: { 
              color: '#91cc75', 
              width: 2,
              shadowColor: 'rgba(145, 204, 117, 0.3)',
              shadowBlur: 4
            },
            itemStyle: { 
              color: '#91cc75',
              borderColor: '#0A1929',
              borderWidth: 2
            },
            symbolSize: 6,
            smooth: true,
            z: 3
          },
          // 预测销量线
          {
            name: '预测销量',
            type: 'line',
            data: [
              ...new Array(historicalData.length).fill(null),
              ...forecastSales
            ],
            lineStyle: { 
              color: '#00BFFF', 
              width: 3,
              type: 'dashed',
              shadowColor: 'rgba(0, 191, 255, 0.3)',
              shadowBlur: 6
            },
            itemStyle: { 
              color: '#00BFFF',
              borderColor: '#0A1929',
              borderWidth: 2
            },
            symbolSize: 8,
            smooth: true,
            z: 3
          }
        ]
      };
      
      this.forecastChartInstance.setOption(option);
    },
    
    // 初始化季节性图表
    initSeasonalChart() {
      const chartContainer = this.$refs.seasonalChart;
      if (!chartContainer) {
        return;
      }
      
      if (this.seasonalChartInstance) {
        this.seasonalChartInstance.dispose();
      }
      
      const isDark = this.theme === 'chalk';
      this.seasonalChartInstance = echarts.init(chartContainer, isDark ? 'dark' : null);
      
      const forecastData = this.prophetData.forecast_data || [];
      
      if (forecastData.length === 0) {
        return;
      }
      
      const months = forecastData.map(item => this.formatMonthName(item.date));
      const seasonalValues = forecastData.map(item => Number(item.seasonal) || 0);

      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(10, 25, 41, 0.7)',
          borderColor: '#00BFFF',
          borderWidth: 1,
          textStyle: { color: '#fff' },
          formatter: function(params) {
            const data = params[0];
            const value = data.value;
            const formatted = value > 0 
              ? `+${Math.abs(value/10000).toFixed(1)}万`
              : `-${Math.abs(value/10000).toFixed(1)}万`;
            return `${data.name}<br/>季节性影响: ${formatted}`;
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '8%',
          top: '8%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: months,
          axisLabel: { 
            color: 'rgba(255, 255, 255, 0.7)',
            rotate: 45,
            fontSize: 11
          },
          axisLine: { lineStyle: { color: 'rgba(0, 191, 255, 0.3)' } },
          axisTick: { lineStyle: { color: 'rgba(0, 191, 255, 0.3)' } }
        },
        yAxis: {
          type: 'value',
          name: '季节性影响',
          nameTextStyle: { color: 'rgba(255, 255, 255, 0.7)' },
          axisLabel: {
            color: 'rgba(255, 255, 255, 0.7)',
            formatter: (value) => (value/10000).toFixed(0) + '万'
          },
          axisLine: { lineStyle: { color: 'rgba(0, 191, 255, 0.3)' } },
          axisTick: { lineStyle: { color: 'rgba(0, 191, 255, 0.3)' } },
          splitLine: { lineStyle: { color: 'rgba(0, 191, 255, 0.1)' } }
        },
        series: [{
          name: '季节性模式',
          type: 'bar',
          data: seasonalValues.map(value => ({
            value: value,
            itemStyle: {
              color: value > 0 
                ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(103, 194, 58, 0.8)' },
                    { offset: 1, color: 'rgba(103, 194, 58, 0.3)' }
                  ])
                : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(245, 108, 108, 0.8)' },
                    { offset: 1, color: 'rgba(245, 108, 108, 0.3)' }
                  ])
            }
          })),
          barWidth: '60%',
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 191, 255, 0.5)'
            }
          }
        }]
      };
      
      this.seasonalChartInstance.setOption(option);
    },
    
    // 计算总预测值
    calculateTotalForecast() {
      if (!this.prophetData?.forecast_data || !Array.isArray(this.prophetData.forecast_data)) {
        return 0;
      }
      
      let total = 0;
      this.prophetData.forecast_data.forEach((item) => {
        const sales = Number(item.predicted_sales) || 0;
        total += sales;
      });
      
      return total;
    },
    
    // 计算月均值
    calculateAvgMonthly() {
      const total = this.calculateTotalForecast();
      const count = this.prophetData?.forecast_data?.length || 1;
      return count > 0 ? Math.round(total / count) : 0;
    },
    
    // 数字格式化
    formatNumber(value, showSign = false) {
      if (value === null || value === undefined || value === '') {
        return '0';
      }
      
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return '0';
      }
      
      const num = Math.abs(numValue);
      let formatted = '';
      
      if (num >= 1000000000) {
        formatted = (num / 1000000000).toFixed(1) + 'B';
      } else if (num >= 1000000) {
        formatted = (num / 1000000).toFixed(1) + 'M';
      } else if (num >= 1000) {
        formatted = (num / 1000).toFixed(1) + 'K';
      } else {
        formatted = Math.round(num).toLocaleString();
      }
      
      if (showSign && numValue !== 0) {
        formatted = (numValue > 0 ? '+' : '-') + formatted;
      } else if (numValue < 0) {
        formatted = '-' + formatted;
      }
      
      return formatted;
    },
    
    // 格式化增长率
    formatGrowthRate(value) {
      const numValue = Number(value) || 0;
      return numValue >= 0 ? `+${numValue.toFixed(1)}%` : `${numValue.toFixed(1)}%`;
    },
    
    // 格式化准确率
    formatAccuracy(value) {
      const numValue = Number(value) || 0;
      return numValue.toFixed(1);
    },
    
    // 格式化时间
    formatTime(timestamp) {
      if (!timestamp) return '未知时间';
      try {
        return new Date(timestamp).toLocaleString('zh-CN');
      } catch (error) {
        return '时间格式错误';
      }
    },
    
    // 格式化月份名称
    formatMonthName(dateStr) {
      if (!dateStr) return '未知';
      
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
      } catch (error) {
        return dateStr || '未知';
      }
    },
    
    // 样式函数
    getSeasonalClass(value) {
      if (value > 0) return 'positive';
      if (value < 0) return 'negative';
      return 'neutral';
    },
    
    getConfidenceTagType(confidence) {
      if (confidence >= 85) return 'success';
      if (confidence >= 75) return 'warning';
      return 'danger';
    },
    
    getConfidenceColor(confidence) {
      if (confidence >= 85) return '#67c23a';
      if (confidence >= 75) return '#e6a23c';
      return '#f56c6c';
    },
    
    getConfidencePercentage(row) {
      return Math.min(100, (row.confidence || 80));
    },
    
    // 事件处理函数
    async refreshData() {
      this.disposeCharts();
      await this.loadProphetData();
      this.$message.success('数据已刷新');
    },
    
    async runAnalysis() {
      try {
        this.$message.info('正在启动Prophet预测分析...');
        
        const response = await this.$http.post('/api/analysis/prophet');
        
        if (response.data.success) {
          this.$message.success('Prophet分析已开始执行，请稍后刷新查看结果');
          setTimeout(() => {
            this.loadProphetData();
          }, 30000);
        } else {
          throw new Error(response.data.message);
        }
      } catch (error) {
        console.error('❌ 启动Prophet分析失败:', error);
        this.$message.error('启动Prophet分析失败: ' + error.message);
      }
    },
    
    exportReport() {
      try {
        const dataStr = JSON.stringify(this.prophetData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `prophet-forecast-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.$message.success('报告导出成功');
      } catch (error) {
        console.error('导出失败:', error);
        this.$message.error('报告导出失败');
      }
    },
    
    goBack() {
      this.$router.push('/');
    }
  }
}
</script>

<style lang="less" scoped>
// 全局容器样式
.com-container {
  width: 100%;
  height: 100vh;
  background-color: #0A1929;
  color: #fff;
  padding: 20px;
  box-sizing: border-box;
  position: relative;
  font-family: 'Roboto', 'Arial', sans-serif;
}

// 头部样式
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  margin-bottom: 20px;
  
  .header-left {
    display: flex;
    flex-direction: column;
    
    .title-box {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
      
      i {
        font-size: 24px;
        margin-right: 10px;
        color: #00BFFF;
      }
      
      h2 {
        font-size: 22px;
        margin: 0;
        font-weight: normal;
        color: #ffffff;
        text-shadow: 0 0 10px rgba(0, 191, 255, 0.5);
      }
    }
    
    .data-overview {
      display: flex;
      gap: 20px;
      
      span {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
        background-color: rgba(0, 191, 255, 0.1);
        padding: 4px 10px;
        border-radius: 4px;
        border: 1px solid rgba(0, 191, 255, 0.3);
      }
    }
  }
  
  .header-right {
    margin-top: 10px;
    width: 100%;
    justify-content: space-between;
    display: flex;
    align-items: center;
    
    .qiehuan {
      width: 24px;
      height: 18px;
      cursor: pointer;
      margin-right: 15px;
    }
    
    .datetime {
      font-size: 14px;
      margin: 0 15px;
      color: rgba(255, 255, 255, 0.7);
    }
  }
}

// 主网格容器
.main-grid-container {
  display: grid;
  grid-template-columns: 3fr 2fr;
  grid-template-rows: 1fr 1fr;
  gap: 20px;
  height: calc(100vh - 100px);
}

// 面板通用样式
.chart-panel {
  background-color: rgba(10, 25, 41, 0.7);
  border: 1px solid #00BFFF;
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(0, 191, 255, 0.5);
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 15px;
    border-bottom: 1px solid rgba(0, 191, 255, 0.3);
    background-color: rgba(0, 191, 255, 0.1);
    
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: normal;
      position: relative;
      padding-left: 15px;
      color: #ffffff;
      
      &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 16px;
        background-color: #00BFFF;
        border-radius: 3px;
      }
    }
    
    .panel-actions {
      display: flex;
      gap: 10px;
      
      i {
        cursor: pointer;
        font-size: 16px;
        color: rgba(255, 255, 255, 0.7);
        
        &:hover {
          color: #00BFFF;
        }
      }
    }
  }
  
  .chart-wrapper {
    flex: 1;
    position: relative;
    
    &.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: #0A1929;
      z-index: 999;
      padding: 20px;
      box-sizing: border-box;
      
      .forecast-chart,
      .seasonal-chart {
        height: calc(100% - 60px);
      }
    }
  }
}

// 预测趋势面板
.forecast-trend-panel {
  .forecast-chart {
    width: 100%;
    height: 100%;
    padding: 10px;
    box-sizing: border-box;
  }
}

// 关键指标面板
.key-metrics-panel {
  .metrics-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 15px;
    padding: 15px;
    height: 100%;
    box-sizing: border-box;
    
    .metric-card {
      background-color: rgba(0, 191, 255, 0.05);
      border: 1px solid rgba(0, 191, 255, 0.2);
      border-radius: 8px;
      padding: 15px;
      display: flex;
      align-items: center;
      
      .card-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: rgba(0, 191, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
        
        i {
          font-size: 24px;
          color: #00BFFF;
        }
      }
      
      .card-content {
        flex: 1;
        
        .metric-label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 5px;
        }
        
        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: #ffffff;
          margin-bottom: 3px;
        }
        
        .metric-change {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          
          &.positive {
            color: #67c23a;
          }
          
          &.negative {
            color: #f56c6c;
          }
        }
      }
    }
  }
}

// 季节性面板
.seasonal-panel {
  .seasonal-chart {
    width: 100%;
    height: 100%;
    padding: 10px;
    box-sizing: border-box;
  }
}

// 洞察面板
.insights-panel {
  .insights-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 15px;
    box-sizing: border-box;
    
    .insights-tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      
      .tab {
        padding: 8px 15px;
        border-radius: 20px;
        background-color: rgba(0, 191, 255, 0.1);
        border: 1px solid rgba(0, 191, 255, 0.3);
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s ease;
        
        i {
          margin-right: 5px;
        }
        
        &:hover {
          background-color: rgba(0, 191, 255, 0.2);
        }
        
        &.active {
          background-color: rgba(0, 191, 255, 0.3);
          color: #ffffff;
          border: 1px solid rgba(0, 191, 255, 0.5);
          box-shadow: 0 0 10px rgba(0, 191, 255, 0.3);
        }
      }
    }
    
    .insights-content {
      flex: 1;
      overflow-y: auto;
      
      &::-webkit-scrollbar {
        width: 6px;
      }
      
      &::-webkit-scrollbar-track {
        background: rgba(0, 191, 255, 0.05);
        border-radius: 3px;
      }
      
      &::-webkit-scrollbar-thumb {
        background: rgba(0, 191, 255, 0.3);
        border-radius: 3px;
      }
      
      .insights-list {
        .insight-item {
          display: flex;
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(0, 191, 255, 0.1);
          
          &:last-child {
            border-bottom: none;
          }
          
          .insight-icon {
            margin-right: 15px;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: rgba(0, 191, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            
            i {
              font-size: 14px;
              color: #00BFFF;
            }
          }
          
          .insight-text {
            flex: 1;
            color: rgba(255, 255, 255, 0.7);
            line-height: 1.5;
            font-size: 14px;
          }
        }
      }
      
      .recommendations-list {
        .recommendation-item {
          background-color: rgba(0, 191, 255, 0.05);
          border: 1px solid rgba(0, 191, 255, 0.2);
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 15px;
          
          .rec-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            
            .rec-category {
              font-weight: bold;
              color: #ffffff;
              font-size: 16px;
            }
            
            .rec-priority {
              padding: 3px 10px;
              border-radius: 12px;
              font-size: 12px;
            }
            
            .priority-高 {
              background-color: rgba(245, 108, 108, 0.7);
              color: white;
            }
            
            .priority-中 {
              background-color: rgba(230, 162, 60, 0.7);
              color: white;
            }
            
            .priority-低 {
              background-color: rgba(144, 147, 153, 0.7);
              color: white;
            }
          }
          
          .rec-content {
            color: rgba(255, 255, 255, 0.7);
            line-height: 1.6;
            margin-bottom: 10px;
            font-size: 14px;
          }
          
          .rec-meta {
            .rec-timeline {
              font-size: 12px;
              color: rgba(255, 255, 255, 0.5);
              background-color: rgba(0, 191, 255, 0.1);
              padding: 3px 10px;
              border-radius: 12px;
            }
          }
        }
      }
    }
  }
}

// 表格查看按钮
.show-table-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #00BFFF;
  color: white;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  display: flex;
  align-items: center;
  box-shadow: 0 0 15px rgba(0, 191, 255, 0.5);
  z-index: 10;
  transition: all 0.3s ease;
  
  i {
    margin-right: 5px;
    font-size: 16px;
  }
  
  &:hover {
    background-color: #00a0d1;
    transform: translateY(-3px);
  }
}

// 表格弹窗样式
.forecast-table-dialog {
  background-color: #0A1929;
  border: 1px solid #00BFFF;
  box-shadow: 0 0 30px rgba(0, 191, 255, 0.5);
  border-radius: 10px;
  
  .el-dialog__header {
    background-color: rgba(0, 191, 255, 0.1);
    padding: 15px 20px;
    border-bottom: 1px solid rgba(0, 191, 255, 0.3);
  }
  
  .el-dialog__title {
    color: #ffffff;
    font-weight: normal;
  }
  
  .el-dialog__body {
    padding: 20px;
    
    .table-wrapper {
      // 自定义表格样式
      /deep/ .el-table {
        background-color: transparent;
        color: #ffffff;
        
        &::before {
          background-color: rgba(0, 191, 255, 0.3);
        }
        
        th {
          background-color: rgba(0, 191, 255, 0.1);
          color: #ffffff;
          border-bottom: 1px solid rgba(0, 191, 255, 0.3);
        }
        
        td {
          background-color: transparent;
          border-bottom: 1px solid rgba(0, 191, 255, 0.1);
        }
        
        tr:hover > td {
          background-color: rgba(0, 191, 255, 0.05);
        }
        
        .forecast-value {
          color: #00BFFF;
          font-weight: 600;
        }
        
        .trend-value {
          color: #67c23a;
        }
        
        .positive { color: #67c23a; }
        .negative { color: #f56c6c; }
        .neutral { color: #e6a23c; }
      }
    }
  }
  
  .el-dialog__footer {
    border-top: 1px solid rgba(0, 191, 255, 0.3);
    padding: 15px 20px;
  }
}

// 加载状态
.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(10, 25, 41, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  color: #fff;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  margin-bottom: 20px;
  border: 3px solid rgba(0, 191, 255, 0.3);
  border-top: 3px solid #00BFFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-grid-container {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, minmax(350px, auto));
    height: auto;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
    height: auto;
    margin-bottom: 15px;
    
    .header-right {
      margin-top: 10px;
      width: 100%;
      justify-content: space-between;
    }
    
    .data-overview {
      flex-wrap: wrap;
      
      span {
        width: 45%;
        margin-bottom: 5px;
      }
    }
  }

  .show-table-btn {
    bottom: 10px;
    right: 10px;
  }
}

@media (max-width: 768px) {
  .main-grid-container {
    gap: 15px;
  }
  
  .metrics-container {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, 1fr);
  }
  
  .insights-tabs {
    flex-direction: column;
    
    .tab {
      width: 100%;
      text-align: center;
    }
  }
  
  .panel-header {
    padding: 8px 12px;
    
    h3 {
      font-size: 14px;
    }
  }
  
  .forecast-chart,
  .seasonal-chart {
    padding: 5px;
  }
  
  .metric-card {
    padding: 10px;
    
    .card-icon {
      width: 40px;
      height: 40px;
      
      i {
        font-size: 18px;
      }
    }
    
    .card-content {
      .metric-value {
        font-size: 18px;
      }
    }
  }
  
  .show-table-btn {
    padding: 8px 15px;
    font-size: 12px;
  }
}
/* 在文件最后加上 */
::-webkit-scrollbar {
  width: 10px;
  background: rgba(0, 191, 255, 0.08);
}
::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #00bfff 0%, #1e90ff 100%);
  border-radius: 8px;
  box-shadow: 0 0 8px #00bfff88;
}
::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #1e90ff 0%, #00bfff 100%);
}
::-webkit-scrollbar-corner {
  background: transparent;
}
</style>
