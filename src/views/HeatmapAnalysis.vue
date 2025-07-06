<!-- filepath: c:\Users\Mcola.Tech\不改动版本\data-view\src\views\HeatmapAnalysis.vue -->
<template>
  <div class="com-container">
    <div class="header">
      <div class="header-left">
        <div class="title-box">
          <i class="el-icon-data-analysis"></i>
          <h2>热力图相关性分析</h2>
        </div>
        <div class="data-overview">
          <span>数据记录: {{ formatNumber(analysisData.basic_statistics?.total_records || 0) }}</span>
          <span>总销量: {{ formatNumber(analysisData.basic_statistics?.total_sales || 0) }}</span>
          <span>均价: ¥{{ formatPrice(analysisData.basic_statistics?.avg_price || 0) }}</span>
          <span>评分: {{ analysisData.basic_statistics?.avg_rating?.toFixed(1) || '0.0' }}</span>
        </div>
      </div>
      <div class="header-right">
        <img v-show="theme == 'chalk'" src="~@/assets/images/qiehuan_dark.png" class="qiehuan" @click="handleChangeTheme" alt="切换主题" title="切换主题" />
        <img v-show="theme != 'chalk'" src="~@/assets/images/qiehuan_light.png" class="qiehuan" @click="handleChangeTheme" alt="切换主题" title="切换主题" />
        <span class="datetime">{{ systemDateTime }}</span>
        <el-button icon="el-icon-back" size="small" type="text" @click="goBack">返回</el-button>
      </div>
    </div>

    <!-- 2x2 网格布局的主容器 -->
    <div class="main-grid-container">
      <!-- 热力图面板 - 左上 -->
      <div class="chart-panel correlation-panel">
        <div class="panel-header">
          <h3>因素相关性热力图</h3>
          <div class="panel-actions">
            <i class="el-icon-refresh-right" @click="retryLoad" title="刷新数据"></i>
            <i :class="fullScreenStatus.correlation ? 'el-icon-minus' : 'el-icon-full-screen'" 
               @click="changeSize('correlation')" title="全屏切换"></i>
          </div>
        </div>
        <div class="chart-wrapper" :class="{ fullscreen: fullScreenStatus.correlation }">
          <div class="heatmap-chart" ref="heatmapChart"></div>
        </div>
      </div>

      <!-- 洞察面板 - 右上 -->
      <div class="chart-panel insights-panel">
        <div class="panel-header">
          <h3>商业洞察</h3>
          <div class="panel-actions">
            <i :class="fullScreenStatus.insights ? 'el-icon-minus' : 'el-icon-full-screen'" 
               @click="changeSize('insights')" title="全屏切换"></i>
          </div>
        </div>
        <div class="chart-wrapper" :class="{ fullscreen: fullScreenStatus.insights }">
          <div class="insights-content">
            <div class="insight-tabs">
              <div 
                v-for="(insight, index) in (analysisData.business_insights || [])" 
                :key="index"
                :class="['insight-tab', { active: currentInsightIndex === index }]"
                @click="showInsight(index)"
              >
                {{ index + 1 }}
              </div>
            </div>
            
            <div class="insight-detail" v-if="currentInsight">
              <div class="insight-header">
                <i :class="currentInsight.icon || 'el-icon-data-analysis'" 
                  :style="{color: '#00BFFF'}"></i>
                <h3>{{ currentInsight.title }}</h3>
              </div>
              
              <div class="insight-body">
                <p>{{ currentInsight.content }}</p>
                <div class="insight-actions" v-if="currentInsight.actions && currentInsight.actions.length > 0">
                  <h4>建议行动：</h4>
                  <ul>
                    <li v-for="(action, actionIndex) in currentInsight.actions" :key="actionIndex">
                      {{ action }}
                    </li>
                  </ul>
                </div>
              </div>
              
              <div class="insight-nav">
                <i class="iconfont icon-left" @click="prevInsight" :style="themeStyle">&#xe6ef;</i>
                <span class="indicator">{{ currentInsightIndex + 1 }}/{{ (analysisData.business_insights || []).length }}</span>
                <i class="iconfont icon-right" @click="nextInsight" :style="themeStyle">&#xe6ed;</i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 因素排行面板 - 左下 -->
      <div class="chart-panel factors-panel">
        <div class="panel-header">
          <h3>销量影响因素排行</h3>
          <div class="panel-actions">
            <i :class="fullScreenStatus.factors ? 'el-icon-minus' : 'el-icon-full-screen'" 
               @click="changeSize('factors')" title="全屏切换"></i>
          </div>
        </div>
        <div class="chart-wrapper" :class="{ fullscreen: fullScreenStatus.factors }">
          <div class="factors-chart" ref="factorsChart"></div>
        </div>
      </div>

      <!-- 战略建议面板 - 右下 -->
      <div class="chart-panel recommendations-panel">
        <div class="panel-header">
          <h3>战略建议</h3>
          <div class="panel-actions">
            <i :class="fullScreenStatus.recommendations ? 'el-icon-minus' : 'el-icon-full-screen'" 
               @click="changeSize('recommendations')" title="全屏切换"></i>
          </div>
        </div>
        <div class="chart-wrapper" :class="{ fullscreen: fullScreenStatus.recommendations }">
          <div class="recommendations-content">
            <div class="recommendation-carousel">
              <div class="recommendation-card" v-if="currentRecommendation">
                <div class="rec-header">
                  <div class="rec-category">{{ currentRecommendation.category }}</div>
                  <div class="rec-priority" :class="`priority-${currentRecommendation.priority}`">
                    {{ currentRecommendation.priority }}
                  </div>
                </div>
                <div class="rec-content">
                  <p class="rec-suggestion">{{ currentRecommendation.suggestion }}</p>
                  <div class="rec-meta">
                    <span class="rec-timeframe">{{ currentRecommendation.timeframe }}</span>
                    <span class="rec-impact" v-if="currentRecommendation.expected_impact">
                      期望效果: {{ currentRecommendation.expected_impact }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="recommendation-controls">
              <div class="recommendation-nav">
                <i class="iconfont icon-left" @click="prevRecommendation" :style="themeStyle">&#xe6ef;</i>
                <span class="indicator">{{ currentRecommendationIndex + 1 }}/{{ (analysisData.strategic_recommendations || []).length }}</span>
                <i class="iconfont icon-right" @click="nextRecommendation" :style="themeStyle">&#xe6ed;</i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载热力图分析数据...</p>
    </div>

    <!-- 错误提示 -->
    <div v-if="error && !loading" class="error-container">
      <div class="error-icon">❌</div>
      <h3>数据加载失败</h3>
      <p>{{ error }}</p>
      <button @click="retryLoad" class="retry-button">重新加载</button>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { mapState } from 'vuex'
import { getThemeValue } from '@/utils/theme_utils'

export default {
  name: 'HeatmapAnalysis',
  data() {
    return {
      analysisData: {
        basic_statistics: {},
        correlation_analysis: { 
          correlation_matrix: {}, 
          significant_pairs: [] 
        },
        sales_factors: [],
        business_insights: [],
        strategic_recommendations: []
      },
      loading: false,
      error: null,
      heatmapChartInstance: null,
      factorsChartInstance: null,
      insightInterval: null,
      recommendationInterval: null,
      currentInsightIndex: 0,
      currentRecommendationIndex: 0,
      systemDateTime: null,
      timerID: null,
      titleFontSize: null,
      // 各组件是否全屏状态
      fullScreenStatus: {
        correlation: false,
        factors: false,
        insights: false,
        recommendations: false
      }
    }
  },

  computed: {
    ...mapState(['theme']),
    hasCorrelationData() {
      return this.analysisData.correlation_analysis && 
             this.analysisData.correlation_analysis.correlation_matrix &&
             Object.keys(this.analysisData.correlation_analysis.correlation_matrix).length > 0
    },
    
    hasSalesFactors() {
      return this.analysisData.sales_factors && this.analysisData.sales_factors.length > 0
    },
    
    hasBusinessInsights() {
      return this.analysisData.business_insights && this.analysisData.business_insights.length > 0
    },
    
    hasStrategicRecommendations() {
      return this.analysisData.strategic_recommendations && this.analysisData.strategic_recommendations.length > 0
    },
    
    currentInsight() {
      if (!this.hasBusinessInsights) return null;
      return this.analysisData.business_insights[this.currentInsightIndex];
    },
    
    currentRecommendation() {
      if (!this.hasStrategicRecommendations) return null;
      return this.analysisData.strategic_recommendations[this.currentRecommendationIndex];
    },
    
    containerStyle() {
      return {
        backgroundColor: getThemeValue(this.theme).backgroundColor || '#161522',
        color: getThemeValue(this.theme).titleColor || '#fff',
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
    this.loadAnalysisData();
    this.startInsightInterval();
    this.startRecommendationInterval();
    this.currentTime();
    window.addEventListener('resize', this.handleResize);
    this.screenAdapter();
  },
  
  beforeDestroy() {
    this.stopInsightInterval();
    this.stopRecommendationInterval();
    clearInterval(this.timerID);
    window.removeEventListener('resize', this.handleResize);
    this.disposeCharts();
  },
  
  watch: {
    theme() {
      this.disposeCharts();
      this.renderCharts();
      this.screenAdapter();
    }
  },
  
  methods: {
    // 屏幕适配函数
    screenAdapter() {
      const mainEl = document.querySelector('.com-container');
      if (mainEl) {
        this.titleFontSize = (mainEl.offsetWidth / 100) * 1.6;
        
        if (this.heatmapChartInstance) {
          this.heatmapChartInstance.resize();
        }
        if (this.factorsChartInstance) {
          this.factorsChartInstance.resize();
        }
      }
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
        this.updateCharts();
      });
    },
    
    // 更新所有图表
    updateCharts() {
      if (this.heatmapChartInstance) {
        this.heatmapChartInstance.resize();
      }
      if (this.factorsChartInstance) {
        this.factorsChartInstance.resize();
      }
    },
    
    // 窗口大小变化处理
    handleResize() {
      this.screenAdapter();
    },
    
    disposeCharts() {
      if (this.heatmapChartInstance) {
        this.heatmapChartInstance.dispose();
        this.heatmapChartInstance = null;
      }
      if (this.factorsChartInstance) {
        this.factorsChartInstance.dispose();
        this.factorsChartInstance = null;
      }
    },

    async loadAnalysisData() {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('📡 开始获取热力图分析数据...');
        
        try {
          const response = await this.$http.get('/api/analysis/heatmap/results');
          console.log('📊 热力图API响应:', response);
          
          if (response && response.data && response.data.success) {
            // 处理嵌套的data结构
            const responseData = response.data.data || response.data;
            this.analysisData = responseData;
          } else {
            throw new Error('API返回数据格式错误');
          }
        } catch (apiError) {
          console.error('❌ API请求失败:', apiError);
          this.loadMockData();
        }
        
        // 等待DOM更新后渲染图表
        this.$nextTick(() => {
          setTimeout(() => {
            this.renderCharts();
            this.loading = false;
          }, 300);
        });
        
      } catch (error) {
        console.error('❌ 热力图数据加载失败:', error);
        this.error = `数据加载失败: ${error.message}`;
        
        // 使用模拟数据作为备选方案
        this.loadMockData();
        
        this.$nextTick(() => {
          setTimeout(() => {
            this.renderCharts();
            this.loading = false;
          }, 300);
        });
      }
    },
    
    loadMockData() {
      console.log('🎭 加载热力图模拟数据...');
      this.analysisData = {
        basic_statistics: {
          total_records: 8567,
          total_sales: 2458930,
          avg_price: 145.7,
          avg_rating: 4.2
        },
        correlation_analysis: {
          correlation_matrix: {
            '销量': { '销量': 1.000, '价格': -0.654, '评分': 0.687, '评价数': 0.534, '浏览量': 0.823 },
            '价格': { '销量': -0.654, '价格': 1.000, '评分': 0.123, '评价数': -0.234, '浏览量': -0.345 },
            '评分': { '销量': 0.687, '价格': 0.123, '评分': 1.000, '评价数': 0.789, '浏览量': 0.456 },
            '评价数': { '销量': 0.534, '价格': -0.234, '评分': 0.789, '评价数': 1.000, '浏览量': 0.345 },
            '浏览量': { '销量': 0.823, '价格': -0.345, '评分': 0.456, '评价数': 0.345, '浏览量': 1.000 }
          }
        },
        sales_factors: [
          { factor: '浏览量', correlation: 0.823, impact: '极强正向' },
          { factor: '评分', correlation: 0.687, impact: '强正向' },
          { factor: '评价数', correlation: 0.534, impact: '中等正向' },
          { factor: '价格', correlation: -0.654, impact: '强负向' }
        ],
        business_insights: [
          {
            title: '流量转化是核心驱动力',
            content: '浏览量与销量呈现强正相关(r=0.823)，提升流量获取能力是增长的关键路径。',
            icon: 'el-icon-view',
            color: '#409eff',
            actions: ['加大搜索引擎优化投入', '优化商品页面转化漏斗', '提升页面加载速度和用户体验']
          },
          {
            title: '价格敏感度显著影响销量',
            content: '价格与销量呈现明显负相关(r=-0.654)，说明消费者对价格较为敏感。',
            icon: 'el-icon-money',
            color: '#f56c6c',
            actions: ['制定动态定价策略', '深入分析竞品价格策略', '优化成本结构降低定价压力']
          },
          {
            title: '产品评分是品质信号',
            content: '评分与销量呈现强正相关(r=0.687)，说明消费者更信任高评分产品。',
            icon: 'el-icon-star-on',
            color: '#e6a23c',
            actions: ['加强产品质量管控', '重视售后问题处理', '鼓励消费者留下积极评价']
          },
          {
            title: '评价数影响购买决策',
            content: '评价数与销量呈现中等正相关(r=0.534)，说明社会认同对购买影响显著。',
            icon: 'el-icon-chat-dot-round',
            color: '#67c23a',
            actions: ['设计评价激励计划', '优化产品页面评价展示', '提高有价值评价的曝光']
          }
        ],
        strategic_recommendations: [
          {
            category: "流量优化",
            suggestion: "浏览量与销量高度相关(0.823)，建议加大流量获取投入",
            priority: "高",
            timeframe: "短期",
            expected_impact: "销量提升25-35%"
          },
          {
            category: "评分管理", 
            suggestion: "评分通过转化率影响销量，建议提升商品质量和服务",
            priority: "高",
            timeframe: "中期",
            expected_impact: "转化率提升15-20%"
          },
          {
            category: "价格策略", 
            suggestion: "利用价格弹性(-0.654)制定差异化定价策略",
            priority: "中",
            timeframe: "中期",
            expected_impact: "利润提升10-15%"
          },
          {
            category: "用户评价", 
            suggestion: "增加真实用户评价数量，提高社会认同度",
            priority: "中",
            timeframe: "长期",
            expected_impact: "转化率提升8-12%"
          }
        ]
      };
    },
    
    async renderCharts() {
      try {
        // 渲染相关性热力图
        if (this.hasCorrelationData) {
          await this.renderCorrelationHeatmap();
        }
        
        // 渲染销量影响因素图表
        if (this.hasSalesFactors) {
          await this.renderSalesFactorsChart();
        }
      } catch (error) {
        console.error('❌ 图表渲染失败:', error);
        this.error = `图表渲染失败: ${error.message}`;
      }
    },
    
    async renderCorrelationHeatmap() {
      try {
        const container = this.$refs.heatmapChart;
        if (!container) {
          throw new Error('找不到热力图容器元素');
        }
        
        // 清理现有图表
        if (this.heatmapChartInstance) {
          this.heatmapChartInstance.dispose();
        }
        
        const isDark = this.theme === 'chalk';
        this.heatmapChartInstance = echarts.init(container, isDark ? 'dark' : null);
        
        const correlationMatrix = this.analysisData.correlation_analysis.correlation_matrix;
        const variables = Object.keys(correlationMatrix);
        
        // 准备热力图数据
        const heatmapData = [];
        variables.forEach((var1, i) => {
          variables.forEach((var2, j) => {
            const value = correlationMatrix[var1][var2];
            if (typeof value === 'number') {
              heatmapData.push([j, i, Number(value.toFixed(3))]);
            }
          });
        });
        
        const option = {
          backgroundColor: 'transparent',
          tooltip: {
            position: 'top',
            formatter: function(params) {
              if (params.data) {
                const var1 = variables[params.data[1]];
                const var2 = variables[params.data[0]];
                const correlation = params.data[2];
                return `${var1} vs ${var2}<br/>相关系数: ${correlation}`;
              }
              return '';
            }
          },
          grid: {
            height: '65%',
            top: '15%',
            left: '12%',
            right: '8%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: variables,
            splitArea: {
              show: true
            },
            axisLine: {
              lineStyle: {
                color: 'rgba(0, 191, 255, 0.3)'
              }
            },
            axisLabel: {
              rotate: 45,
              fontSize: 12,
              color: 'rgba(255, 255, 255, 0.7)'
            }
          },
          yAxis: {
            type: 'category',
            data: variables,
            splitArea: {
              show: true
            },
            axisLine: {
              lineStyle: {
                color: 'rgba(0, 191, 255, 0.3)'
              }
            },
            axisLabel: {
              fontSize: 12,
              color: 'rgba(255, 255, 255, 0.7)'
            }
          },
          visualMap: {
            min: -1,
            max: 1,
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '5%',
            inRange: {
              color: [
                '#053061', '#0c3c7c', '#2166ac', '#4393c3', '#92c5de', 
                '#d1e5f0', '#fddbc7', '#f4a582', '#d6604d', '#b2182b', '#67001f'
              ]
            },
            text: ['强正相关', '强负相关'],
            textStyle: {
              fontSize: 12,
              color: 'rgba(255, 255, 255, 0.7)'
            }
          },
          series: [{
            name: '相关系数',
            type: 'heatmap',
            data: heatmapData,
            label: {
              show: false  // 隐藏热力图上的数值，让视觉更干净
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 15,
                shadowColor: 'rgba(0, 191, 255, 0.7)'
              }
            }
          }]
        };
        
        this.heatmapChartInstance.setOption(option);
      } catch (error) {
        console.error('❌ 热力图渲染失败:', error);
        throw error;
      }
    },
    
    async renderSalesFactorsChart() {
      try {
        const container = this.$refs.factorsChart;
        if (!container) {
          throw new Error('找不到销量影响因素图表容器');
        }
        
        // 清理现有图表
        if (this.factorsChartInstance) {
          this.factorsChartInstance.dispose();
        }
        
        const isDark = this.theme === 'chalk';
        this.factorsChartInstance = echarts.init(container, isDark ? 'dark' : null);
        
        const factors = this.analysisData.sales_factors;
        const factorNames = factors.map(f => f.factor);
        const correlations = factors.map(f => Math.abs(f.correlation));
        const originalCorrelations = factors.map(f => f.correlation);
        
        const option = {
          backgroundColor: 'transparent',
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            },
            formatter: function(params) {
              const data = params[0];
              const factor = factors[data.dataIndex];
              return `${factor.factor}<br/>相关系数: ${factor.correlation.toFixed(3)}<br/>影响程度: ${factor.impact}`;
            }
          },
          grid: {
            left: '15%',
            right: '10%',
            top: '10%',
            bottom: '15%',
            containLabel: true
          },
          xAxis: {
            type: 'value',
            axisLine: {
              show: false  // 隐藏坐标轴线
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(0, 191, 255, 0.15)'  // 更柔和的网格线颜色
              }
            },
            axisLabel: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          },
          yAxis: {
            type: 'category',
            data: factorNames,
            axisLine: {
              show: false  // 隐藏坐标轴线
            },
            axisLabel: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          },
          series: [{
            name: '相关系数',
            type: 'bar',
            data: correlations.map((value, index) => ({
              value: value,
              itemStyle: {
                // 统一使用亮蓝色的渐变
                color: new echarts.graphic.LinearGradient(
                  0, 0, 1, 0,
                  [
                    { offset: 0, color: 'rgba(0, 191, 255, 0.2)' },
                    { offset: 1, color: originalCorrelations[index] > 0 
                      ? 'rgba(0, 191, 255, 0.8)' 
                      : 'rgba(255, 77, 79, 0.8)' }
                  ]
                )
              }
            })),
            barWidth: '60%',
            emphasis: {
              itemStyle: {
                shadowBlur: 15,
                shadowColor: 'rgba(0, 191, 255, 0.7)'
              }
            }
          }]
        };
        
        this.factorsChartInstance.setOption(option);
      } catch (error) {
        console.error('❌ 销量影响因素图表渲染失败:', error);
        throw error;
      }
    },
    
    // 洞察导航功能
    prevInsight() {
      if (!this.hasBusinessInsights) return;
      const totalInsights = this.analysisData.business_insights.length;
      this.currentInsightIndex = (this.currentInsightIndex - 1 + totalInsights) % totalInsights;
      this.stopInsightInterval();
      this.startInsightInterval();
    },
    
    nextInsight() {
      if (!this.hasBusinessInsights) return;
      const totalInsights = this.analysisData.business_insights.length;
      this.currentInsightIndex = (this.currentInsightIndex + 1) % totalInsights;
      this.stopInsightInterval();
      this.startInsightInterval();
    },
    
    // 显示特定洞察
    showInsight(index) {
      if (this.hasBusinessInsights && index >= 0 && index < this.analysisData.business_insights.length) {
        this.currentInsightIndex = index;
        this.stopInsightInterval();
        this.startInsightInterval();
      }
    },
    
    // 开始洞察轮播
    startInsightInterval() {
      this.stopInsightInterval();
      if (this.hasBusinessInsights) {
        this.insightInterval = setInterval(() => {
          const totalInsights = this.analysisData.business_insights.length;
          if (totalInsights > 0) {
            this.currentInsightIndex = (this.currentInsightIndex + 1) % totalInsights;
          }
        }, 6000);
      }
    },
    
    // 停止洞察轮播
    stopInsightInterval() {
      if (this.insightInterval) {
        clearInterval(this.insightInterval);
        this.insightInterval = null;
      }
    },
    
    // 建议导航功能
    prevRecommendation() {
      if (!this.hasStrategicRecommendations) return;
      const totalRecs = this.analysisData.strategic_recommendations.length;
      this.currentRecommendationIndex = (this.currentRecommendationIndex - 1 + totalRecs) % totalRecs;
      this.stopRecommendationInterval();
      this.startRecommendationInterval();
    },
    
    nextRecommendation() {
      if (!this.hasStrategicRecommendations) return;
      const totalRecs = this.analysisData.strategic_recommendations.length;
      this.currentRecommendationIndex = (this.currentRecommendationIndex + 1) % totalRecs;
      this.stopRecommendationInterval();
      this.startRecommendationInterval();
    },
    
    // 开始建议轮播
    startRecommendationInterval() {
      this.stopRecommendationInterval();
      if (this.hasStrategicRecommendations) {
        this.recommendationInterval = setInterval(() => {
          const totalRecs = this.analysisData.strategic_recommendations.length;
          if (totalRecs > 0) {
            this.currentRecommendationIndex = (this.currentRecommendationIndex + 1) % totalRecs;
          }
        }, 8000);
      }
    },
    
    // 停止建议轮播
    stopRecommendationInterval() {
      if (this.recommendationInterval) {
        clearInterval(this.recommendationInterval);
        this.recommendationInterval = null;
      }
    },
    
    // 重新加载数据
    async retryLoad() {
      this.error = null;
      await this.loadAnalysisData();
    },
    
    // 导出报告
    exportReport() {
      try {
        const dataStr = JSON.stringify(this.analysisData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `heatmap-analysis-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.$message.success('报告导出成功');
      } catch (error) {
        console.error('导出失败:', error);
        this.$message.error('报告导出失败');
      }
    },
    
    goBack() {
      this.$router.push('/');
    },
    
    formatNumber(num) {
      if (!num) return '0';
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    
    formatPrice(price) {
      if (!price) return '0.00';
      return Number(price).toFixed(2);
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
  grid-template-columns: 1.2fr 0.8fr;
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
      
      .heatmap-chart,
      .factors-chart {
        height: calc(100% - 60px);
      }
    }
  }
}

// 热力图面板
.correlation-panel {
  .heatmap-chart {
    width: 100%;
    height: 100%;
    padding: 10px;
    box-sizing: border-box;
  }
}

// 因素排行面板
.factors-panel {
  .factors-chart {
    width: 100%;
    height: 100%;
    padding: 10px;
    box-sizing: border-box;
  }
}

// 洞察面板
.insights-panel {
  .insights-content {
    height: 100%;
    padding: 15px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    
    .insight-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 15px;
      flex-wrap: wrap;
      
      .insight-tab {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background-color: rgba(0, 191, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        cursor: pointer;
        border: 1px solid rgba(0, 191, 255, 0.3);
        
        &:hover {
          background-color: rgba(0, 191, 255, 0.3);
        }
        
        &.active {
          background-color: rgba(0, 191, 255, 0.8);
          color: white;
          box-shadow: 0 0 10px rgba(0, 191, 255, 0.7);
        }
      }
    }
    
    .insight-detail {
      flex: 1;
      display: flex;
      flex-direction: column;
      
      .insight-header {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        
        i {
          font-size: 24px;
          margin-right: 10px;
          color: #00BFFF;
        }
        
        h3 {
          font-size: 16px;
          margin: 0;
          color: #ffffff;
        }
      }
      
      .insight-body {
        flex: 1;
        
        p {
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin-bottom: 15px;
        }
        
        .insight-actions {
          h4 {
            font-size: 14px;
            margin: 0 0 10px 0;
            font-weight: normal;
            color: #ffffff;
          }
          
          ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          
          li {
            position: relative;
            padding: 3px 0 3px 15px;
            color: rgba(255, 255, 255, 0.7);
            font-size: 13px;
            
            &:before {
              content: "•";
              color: #00BFFF;
              position: absolute;
              left: 0;
            }
          }
        }
      }
      
      .insight-nav {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 15px;
        
        i {
          cursor: pointer;
          font-size: 16px;
          color: rgba(255, 255, 255, 0.7);
          
          &:hover {
            color: #00BFFF;
          }
        }
        
        .indicator {
          margin: 0 10px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
        }
      }
    }
  }
}

// 建议面板
.recommendations-panel {
  .recommendations-content {
    height: 100%;
    padding: 15px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    
    .recommendation-carousel {
      flex: 1;
      display: flex;
      flex-direction: column;
      
      .recommendation-card {
        background-color: rgba(0, 191, 255, 0.05);
        border: 1px solid rgba(0, 191, 255, 0.2);
        border-radius: 8px;
        padding: 15px;
        
        .rec-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          
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
          .rec-suggestion {
            color: rgba(255, 255, 255, 0.7);
            line-height: 1.6;
            margin-bottom: 15px;
          }
          
          .rec-meta {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            
            .rec-timeframe {
              background: rgba(0, 191, 255, 0.1);
              padding: 4px 10px;
              border-radius: 12px;
              color: rgba(255, 255, 255, 0.7);
              border: 1px solid rgba(0, 191, 255, 0.3);
            }
            
            .rec-impact {
              color: #4caf50;
            }
          }
        }
      }
    }
    
    .recommendation-controls {
      margin-top: 15px;
      
      .recommendation-nav {
        display: flex;
        align-items: center;
        justify-content: center;
        
        i {
          cursor: pointer;
          font-size: 16px;
          color: rgba(255, 255, 255, 0.7);
          
          &:hover {
            color: #00BFFF;
          }
        }
        
        .indicator {
          margin: 0 10px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
        }
      }
    }
  }
}

// 加载和错误状态
.loading-container,
.error-container {
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

.error-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.retry-button {
  background: #00BFFF;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
  
  &:hover {
    background: rgba(0, 191, 255, 0.8);
    box-shadow: 0 0 15px rgba(0, 191, 255, 0.5);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-grid-container {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, 1fr);
    gap: 15px;
  }
}

@media (max-width: 768px) {
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
  }
  
  .data-overview {
    flex-wrap: wrap;
    
    span {
      width: 45%;
      margin-bottom: 5px;
    }
  }
  
  .main-grid-container {
    height: calc(100vh - 140px);
  }
  
  .chart-panel {
    .panel-header {
      padding: 8px 12px;
      
      h3 {
        font-size: 14px;
      }
    }
  }
}
</style>