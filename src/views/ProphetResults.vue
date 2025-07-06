<template>
  <div class="prophet-results">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>📈 Prophet时间序列预测分析</h1>
      <div class="analysis-info">
        <span>分析时间：{{ formatTime(prophetData.timestamp) }}</span>
        <span>预测年度：{{ prophetData.forecast_summary?.forecast_year || 2025 }}年</span>
        <span>模型精度：{{ prophetData.model_info?.performance?.accuracy_level || '优秀' }}</span>
      </div>
      <div class="action-buttons">
        <el-button type="primary" @click="refreshData" :loading="loading">
          <i class="el-icon-refresh"></i> 重新预测
        </el-button>
        <el-button type="success" @click="exportReport">
          <i class="el-icon-download"></i> 导出报告
        </el-button>
        <el-button @click="goBack">
          <i class="el-icon-back"></i> 返回首页
        </el-button>
      </div>
    </div>

    <!-- 模型性能指标 -->
    <div class="performance-section">
      <h2 class="section-title">模型性能指标</h2>
      <div class="performance-cards">
        <div class="metric-card accuracy">
          <div class="card-icon">
            <i class="el-icon-pie-chart"></i>
          </div>
          <div class="card-content">
            <h3>预测精度</h3>
            <div class="value">{{ prophetData.model_info?.performance?.mape || 8.5 }}%</div>
            <div class="desc">MAPE误差率</div>
          </div>
        </div>

        <div class="metric-card mae">
          <div class="card-icon">
            <i class="el-icon-data-analysis"></i>
          </div>
          <div class="card-content">
            <h3>平均绝对误差</h3>
            <div class="value">{{ (prophetData.model_info?.performance?.mae || 0.045).toFixed(3) }}</div>
            <div class="desc">MAE指标</div>
          </div>
        </div>

        <div class="metric-card rmse">
          <div class="card-icon">
            <i class="el-icon-aim"></i>
          </div>
          <div class="card-content">
            <h3>均方根误差</h3>
            <div class="value">{{ (prophetData.model_info?.performance?.rmse || 0.062).toFixed(3) }}</div>
            <div class="desc">RMSE指标</div>
          </div>
        </div>

        <div class="metric-card growth">
          <div class="card-icon">
            <i class="el-icon-trend-charts"></i>
          </div>
          <div class="card-content">
            <h3>增长预期</h3>
            <div class="value">+{{ prophetData.forecast_summary?.growth_rate || 8.5 }}%</div>
            <div class="desc">年增长率</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 预测概览 -->
    <div class="forecast-overview">
      <h2 class="section-title">预测概览</h2>
      <div class="overview-cards">
        <div class="overview-card total">
          <div class="card-header">
            <i class="el-icon-s-data"></i>
            <h3>年度总预测</h3>
          </div>
          <div class="card-value">{{ formatNumber(prophetData.forecast_summary?.total_forecast || 114000) }}</div>
          <div class="card-desc">预计年度总销量</div>
        </div>

        <div class="overview-card monthly">
          <div class="card-header">
            <i class="el-icon-date"></i>
            <h3>月均预测</h3>
          </div>
          <div class="card-value">{{ formatNumber(prophetData.forecast_summary?.avg_monthly || 9500) }}</div>
          <div class="card-desc">月平均销量</div>
        </div>

        <div class="overview-card confidence">
          <div class="card-header">
            <i class="el-icon-success"></i>
            <h3>置信区间</h3>
          </div>
          <div class="card-range">
            <span class="lower">{{ formatNumber(prophetData.forecast_summary?.confidence_lower || 96900) }}</span>
            <span class="separator">~</span>
            <span class="upper">{{ formatNumber(prophetData.forecast_summary?.confidence_upper || 131100) }}</span>
          </div>
          <div class="card-desc">95%置信区间</div>
        </div>
      </div>
    </div>

    <!-- 预测可视化 -->
    <div class="visualization-section">
      <h2 class="section-title">预测可视化分析</h2>
      <div class="charts-grid">
        <div class="chart-card forecast-chart">
          <h3>时间序列预测图</h3>
          <div ref="forecastChart" class="chart"></div>
        </div>
        <div class="chart-card seasonal-chart">
          <h3>季节性分析图</h3>
          <div ref="seasonalChart" class="chart"></div>
        </div>
      </div>
    </div>

    <!-- 月度预测详情 -->
    <div class="monthly-forecast">
      <h2 class="section-title">月度预测详情</h2>
      <div class="forecast-table-container">
        <el-table 
          :data="prophetData.monthly_forecast || []" 
          stripe 
          style="width: 100%"
          :header-cell-style="{backgroundColor: '#f5f7fa', color: '#303133'}"
        >
          <el-table-column prop="month_name" label="月份" width="120" align="center"></el-table-column>
          <el-table-column label="预测销量" width="140" align="center">
            <template slot-scope="scope">
              <span class="forecast-value">{{ formatNumber(scope.row.forecast) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="置信区间" width="200" align="center">
            <template slot-scope="scope">
              <span class="confidence-range">
                {{ formatNumber(scope.row.lower_bound) }} ~ {{ formatNumber(scope.row.upper_bound) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="趋势分量" width="120" align="center">
            <template slot-scope="scope">
              <span :class="['trend-value', scope.row.trend > 0 ? 'positive' : 'negative']">
                {{ (scope.row.trend * 100).toFixed(1) }}%
              </span>
            </template>
          </el-table-column>
          <el-table-column label="季节性分量" width="130" align="center">
            <template slot-scope="scope">
              <span :class="['seasonal-value', scope.row.seasonal > 0 ? 'positive' : 'negative']">
                {{ (scope.row.seasonal * 100).toFixed(1) }}%
              </span>
            </template>
          </el-table-column>
          <el-table-column label="预测区间" align="center">
            <template slot-scope="scope">
              <div class="forecast-range">
                <div class="range-bar">
                  <div 
                    class="range-fill" 
                    :style="{
                      left: '10%',
                      width: '80%',
                      backgroundColor: scope.row.seasonal > 0 ? '#67c23a' : '#e6a23c'
                    }"
                  ></div>
                  <div class="range-point" :style="{left: '50%'}"></div>
                </div>
                <div class="range-label">
                  <span class="confidence">95%置信度</span>
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 趋势分析 -->
    <div class="trend-analysis">
      <h2 class="section-title">趋势分析</h2>
      <div class="trend-cards">
        <div 
          v-for="(trendData, year) in prophetData.trend_analysis || {}" 
          :key="year"
          class="trend-card"
          v-if="year !== 'growth_2024' && year !== 'growth_2025_forecast'"
        >
          <div class="trend-year">{{ year }}年</div>
          <div class="trend-level">
            <div class="level-bar">
              <div 
                class="level-fill" 
                :style="{width: (trendData.trend_level * 100) + '%'}"
              ></div>
            </div>
            <span class="level-value">{{ (trendData.trend_level * 100).toFixed(1) }}%</span>
          </div>
          <div class="trend-desc">
            <span class="data-points">{{ trendData.data_points }} 个数据点</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 季节性分析 -->
    <div class="seasonality-section">
      <h2 class="section-title">季节性模式分析</h2>
      <div class="seasonality-grid">
        <div class="peak-months">
          <h3>📈 销售高峰月份</h3>
          <div class="months-list">
            <div 
              v-for="peak in prophetData.seasonality_analysis?.peak_months || []" 
              :key="peak.month"
              class="month-item peak"
            >
              <span class="month-name">{{ peak.month }}</span>
              <span class="month-impact">+{{ (peak.coefficient * 100).toFixed(1) }}%</span>
            </div>
          </div>
        </div>

        <div class="low-months">
          <h3>📉 销售低谷月份</h3>
          <div class="months-list">
            <div 
              v-for="low in prophetData.seasonality_analysis?.low_months || []" 
              :key="low.month"
              class="month-item low"
            >
              <span class="month-name">{{ low.month }}</span>
              <span class="month-impact">{{ (low.coefficient * 100).toFixed(1) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 商业洞察 -->
    <div class="insights-section">
      <h2 class="section-title">商业洞察</h2>
      <div class="insights-grid">
        <div 
          v-for="(insight, index) in prophetData.business_insights || []" 
          :key="index"
          class="insight-card"
        >
          <div class="insight-icon">
            <i :class="getInsightIcon(index)"></i>
          </div>
          <div class="insight-content">{{ insight }}</div>
        </div>
      </div>
    </div>

    <!-- 战略建议 -->
    <div class="recommendations-section">
      <h2 class="section-title">战略建议</h2>
      <div class="recommendations-grid">
        <div 
          v-for="(rec, index) in prophetData.strategic_recommendations || []" 
          :key="index"
          class="recommendation-card"
          :class="`impact-${rec.impact?.toLowerCase()}`"
        >
          <div class="rec-header">
            <div class="rec-category">
              <i :class="getCategoryIcon(rec.category)"></i>
              <span>{{ rec.category }}</span>
            </div>
            <div class="rec-meta">
              <span class="impact-badge" :class="`impact-${rec.impact?.toLowerCase()}`">
                {{ rec.impact }}影响
              </span>
              <span class="timeline-badge">{{ rec.timeline }}</span>
            </div>
          </div>
          <div class="rec-content">{{ rec.recommendation }}</div>
        </div>
      </div>
    </div>

    <!-- 回到顶部按钮 -->
    <div class="scroll-to-top" @click="scrollToTop" v-show="showScrollTop">
      <i class="el-icon-top"></i>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'ProphetForecast',
  data() {
    return {
      prophetData: {
        timestamp: '',
        model_info: {
          type: 'Prophet时间序列预测',
          forecast_periods: 12,
          performance: {
            accuracy: 91.5,
            accuracy_level: '优秀'
          }
        },
        forecast_summary: {
          total_forecast: 0,
          avg_monthly: 0,
          growth_rate: 0,
          forecast_year: 2025
        },
        monthly_forecast: [],
        business_insights: [],
        strategic_recommendations: [],
        seasonality_analysis: {
          peak_months: [],
          low_months: []
        }
      },
      loading: false,
      showBackToTop: false,
      forecastChartInstance: null,
      seasonalChartInstance: null
    }
  },
  
  mounted() {
    console.log('📊 ProphetForecast组件已挂载')
    this.loadProphetData()
    this.bindScrollEvent()
  },
  
  methods: {
    // 🔧 修复：加载Prophet预测数据
    async loadProphetData() {
      try {
        this.loading = true
        console.log('🔄 开始加载Prophet预测数据...')
        
        const response = await this.$http.get('/api/analysis/prophet/results')
        console.log('📡 API响应:', response)
        
        if (response && response.data && response.data.success && response.data.data) {
          const apiData = response.data.data
          console.log('✅ 原始API数据:', apiData)
          
          // 🎯 转换API数据格式
          this.prophetData = this.transformApiData(apiData)
          
          console.log('📊 转换后的数据:', this.prophetData)
          
          // 强制更新组件
          this.$forceUpdate()
          
          // 初始化图表
          this.$nextTick(() => {
            console.log('🎨 开始初始化图表...')
            this.initCharts()
          })
          
        } else {
          console.error('❌ API数据格式错误:', response)
          throw new Error('API返回数据格式错误')
        }
        
      } catch (error) {
        console.error('❌ 加载Prophet数据失败:', error)
        this.$message.warning('数据加载失败，使用默认数据显示')
        
        // 使用默认数据
        this.prophetData = this.getDefaultData()
        this.$forceUpdate()
        
        this.$nextTick(() => {
          this.initCharts()
        })
      } finally {
        this.loading = false
      }
    },

    // 🎯 新增：转换API数据格式
    transformApiData(apiData) {
      console.log('🔄 开始转换API数据...')
      
      // 转换预测数据
      const forecastData = (apiData.forecast_data || []).map(item => ({
        month: item.date,
        month_name: this.formatMonthName(item.date),
        forecast: Math.round(Number(item.predicted_sales || 0)),
        lower_bound: Math.round(Number(item.lower_bound || 0)),
        upper_bound: Math.round(Number(item.upper_bound || 0)),
        trend: Math.round(Number(item.trend || 0)),
        seasonal: Math.round(Number(item.seasonal || 0)),
        confidence: Number(item.confidence || 80)
      }))
      
      console.log('📅 转换后的月度预测:', forecastData)
      
      // 计算汇总数据
      const totalForecast = forecastData.reduce((sum, item) => sum + item.forecast, 0)
      const avgMonthly = forecastData.length > 0 ? Math.round(totalForecast / forecastData.length) : 0
      const growthRate = Number(apiData.trend_analysis?.growth_rate || 0)
      
      console.log('📊 计算汇总:')
      console.log('  - 总预测:', totalForecast)
      console.log('  - 月均:', avgMonthly)
      console.log('  - 增长率:', growthRate)
      
      // 生成季节性分析
      const seasonalityAnalysis = this.generateSeasonalityAnalysis(forecastData)
      
      return {
        timestamp: apiData.timestamp,
        model_info: {
          type: apiData.model_info?.algorithm || 'Prophet时间序列预测',
          forecast_periods: apiData.model_info?.forecast_points || 12,
          performance: {
            accuracy: apiData.model_performance?.accuracy || 91.5,
            accuracy_level: this.getAccuracyLevel(apiData.model_performance?.accuracy || 91.5),
            mape: apiData.model_performance?.mape || 7.2
          }
        },
        forecast_summary: {
          total_forecast: totalForecast,
          avg_monthly: avgMonthly,
          growth_rate: growthRate,
          forecast_year: 2025
        },
        monthly_forecast: forecastData,
        business_insights: apiData.business_insights || [],
        strategic_recommendations: apiData.recommendations || [],
        seasonality_analysis: seasonalityAnalysis
      }
    },

    // 🔧 修复：格式化月份名称
    formatMonthName(dateStr) {
      try {
        const date = new Date(dateStr)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        return `${year}年${month}月`
      } catch (error) {
        console.warn('⚠️ 日期格式化失败:', dateStr, error)
        return dateStr || '未知月份'
      }
    },

    // 🎯 新增：生成季节性分析
    generateSeasonalityAnalysis(forecastData) {
      if (!forecastData || forecastData.length === 0) {
        return {
          peak_months: [
            { month: '11月', coefficient: 1.5 },
            { month: '12月', coefficient: 1.3 },
            { month: '1月', coefficient: 1.2 }
          ],
          low_months: [
            { month: '3月', coefficient: 0.7 },
            { month: '4月', coefficient: 0.8 },
            { month: '5月', coefficient: 0.9 }
          ]
        }
      }
      
      // 基于seasonal数据分析季节性模式
      const seasonalData = forecastData.map(item => {
        const date = new Date(item.month)
        const month = date.getMonth() + 1
        const monthName = `${month}月`
        
        // 计算相对系数
        const avgSeasonal = forecastData.reduce((sum, d) => sum + d.seasonal, 0) / forecastData.length
        const relativeCoeff = item.seasonal === 0 ? 1 : (item.seasonal / Math.abs(avgSeasonal)) + 1
        
        return {
          month,
          monthName,
          seasonal: item.seasonal,
          coefficient: Math.max(0.5, Math.min(2.0, Math.abs(relativeCoeff)))
        }
      })
      
      // 按季节性强度排序
      const sortedBySeasonal = [...seasonalData].sort((a, b) => b.seasonal - a.seasonal)
      
      const peakMonths = sortedBySeasonal.slice(0, 3).map(item => ({
        month: item.monthName,
        coefficient: Math.max(1.0, item.coefficient)
      }))
      
      const lowMonths = sortedBySeasonal.slice(-3).reverse().map(item => ({
        month: item.monthName,
        coefficient: Math.min(1.0, item.coefficient)
      }))
      
      return {
        peak_months: peakMonths,
        low_months: lowMonths
      }
    },

    // 🔧 修复：初始化预测趋势图
    initForecastChart() {
      console.log('🎨 初始化预测趋势图...')
      
      if (!this.$refs.forecastChart) {
        console.error('❌ 找不到预测图表容器')
        return
      }
      
      const monthlyData = this.prophetData.monthly_forecast || []
      console.log('📊 图表使用的月度数据:', monthlyData)
      
      if (monthlyData.length === 0) {
        console.warn('⚠️ 月度预测数据为空，无法绘制图表')
        return
      }
      
      // 销毁现有图表实例
      if (this.forecastChartInstance) {
        this.forecastChartInstance.dispose()
      }
      
      this.forecastChartInstance = echarts.init(this.$refs.forecastChart)
      
      const months = monthlyData.map(item => item.month_name || item.month)
      const forecasts = monthlyData.map(item => Number(item.forecast || 0))
      const lowerBounds = monthlyData.map(item => Number(item.lower_bound || 0))
      const upperBounds = monthlyData.map(item => Number(item.upper_bound || 0))
      
      console.log('📈 图表数据准备:')
      console.log('月份:', months)
      console.log('预测值:', forecasts)
      
      const option = {
        title: {
          text: '销量预测趋势图',
          left: 'center',
          textStyle: { color: '#333', fontSize: 16, fontWeight: 600 }
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#ddd',
          borderWidth: 1,
          textStyle: { color: '#333' },
          formatter: (params) => {
            let result = `<div style="padding: 8px;">
              <div style="font-weight: 600; margin-bottom: 8px; color: #333;">
                ${params[0].axisValue}
              </div>`
            
            params.forEach(param => {
              if (param.seriesName === '预测销量') {
                const dataIndex = param.dataIndex
                const currentData = monthlyData[dataIndex]
                
                result += `
                  <div style="display: flex; align-items: center; margin-bottom: 4px;">
                    <span style="display: inline-block; width: 10px; height: 10px; background: ${param.color}; border-radius: 50%; margin-right: 8px;"></span>
                    <span>预测销量: <strong>${this.formatNumber(param.value)}</strong></span>
                  </div>
                  <div style="margin-left: 18px; font-size: 12px; color: #666;">
                    置信区间: ${this.formatNumber(currentData.lower_bound)} ~ ${this.formatNumber(currentData.upper_bound)}
                  </div>
                  <div style="margin-left: 18px; font-size: 12px; color: #666;">
                    趋势: ${this.formatNumber(currentData.trend)} | 季节性: ${this.formatNumber(currentData.seasonal, true)}
                  </div>`
              }
            })
            
            result += '</div>'
            return result
          }
        },
        legend: {
          data: ['置信区间', '预测销量'],
          bottom: 10,
          textStyle: { color: '#333' }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: months,
          axisLabel: { 
            color: '#333',
            rotate: 45,
            interval: 0,
            fontSize: 11
          },
          axisLine: { lineStyle: { color: '#ddd' } },
          axisTick: { lineStyle: { color: '#ddd' } }
        },
        yAxis: {
          type: 'value',
          axisLabel: { 
            color: '#333',
            formatter: (value) => this.formatNumber(value)
          },
          axisLine: { lineStyle: { color: '#ddd' } },
          axisTick: { lineStyle: { color: '#ddd' } },
          splitLine: { lineStyle: { color: '#f0f0f0' } }
        },
        series: [
          {
            name: '置信区间',
            type: 'line',
            data: monthlyData.map((item, index) => [lowerBounds[index], upperBounds[index]]),
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
                { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
              ])
            },
            lineStyle: { opacity: 0 },
            symbol: 'none',
            tooltip: { show: false },
            z: 1
          },
          {
            name: '预测销量',
            type: 'line',
            data: forecasts,
            lineStyle: { 
              color: '#409eff', 
              width: 3,
              shadowColor: 'rgba(64, 158, 255, 0.3)',
              shadowBlur: 6
            },
            itemStyle: { 
              color: '#409eff',
              borderColor: '#fff',
              borderWidth: 2
            },
            symbolSize: 8,
            smooth: true,
            emphasis: {
              itemStyle: { 
                shadowBlur: 15, 
                shadowColor: 'rgba(64, 158, 255, 0.6)',
                scale: 1.2
              }
            },
            z: 2
          }
        ]
      }
      
      this.forecastChartInstance.setOption(option)
      console.log('✅ 预测趋势图初始化完成')
    },

    // 🔧 修复：初始化季节性图表
    initSeasonalChart() {
      if (!this.$refs.seasonalChart) {
        console.error('❌ 找不到季节性图表容器')
        return
      }
      
      if (this.seasonalChartInstance) {
        this.seasonalChartInstance.dispose()
      }
      
      this.seasonalChartInstance = echarts.init(this.$refs.seasonalChart)
      
      const peakMonths = this.prophetData.seasonality_analysis?.peak_months || []
      const lowMonths = this.prophetData.seasonality_analysis?.low_months || []
      
      const peakData = peakMonths.map(item => ({
        name: item.month,
        value: item.coefficient,
        itemStyle: { color: '#67c23a' }
      }))
      
      const lowData = lowMonths.map(item => ({
        name: item.month,
        value: Math.abs(item.coefficient),
        itemStyle: { color: '#f56c6c' }
      }))
      
      const option = {
        title: {
          text: '季节性模式分析',
          left: 'center',
          textStyle: { color: '#333', fontSize: 16 }
        },
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            return `${params.name}<br/>季节性系数: ${params.value.toFixed(2)}`
          }
        },
        legend: {
          data: ['高峰月份', '低谷月份'],
          bottom: 10,
          textStyle: { color: '#333' }
        },
        series: [
          {
            name: '高峰月份',
            type: 'pie',
            radius: ['30%', '50%'],
            center: ['25%', '50%'],
            data: peakData,
            label: {
              formatter: '{b}\n{d}%'
            },
            labelLine: {
              show: true
            }
          },
          {
            name: '低谷月份',
            type: 'pie',
            radius: ['30%', '50%'],
            center: ['75%', '50%'],
            data: lowData,
            label: {
              formatter: '{b}\n{d}%'
            },
            labelLine: {
              show: true
            }
          }
        ]
      }
      
      this.seasonalChartInstance.setOption(option)
      console.log('✅ 季节性分析图初始化完成')
    },

    // 🔧 修复：初始化所有图表
    initCharts() {
      console.log('🎨 开始初始化Prophet图表...')
      console.log('📊 当前月度预测数据:', this.prophetData.monthly_forecast)
      
      if (!this.prophetData || !this.prophetData.monthly_forecast || this.prophetData.monthly_forecast.length === 0) {
        console.error('❌ 数据不完整，无法初始化图表')
        return
      }
      
      try {
        setTimeout(() => {
          this.initForecastChart()
          this.initSeasonalChart()
          console.log('✅ 所有图表初始化完成')
        }, 100)
      } catch (error) {
        console.error('❌ 图表初始化失败:', error)
      }
    },

    // 获取默认数据
    getDefaultData() {
      return {
        timestamp: new Date().toISOString(),
        model_info: {
          type: 'Prophet时间序列预测',
          forecast_periods: 12,
          performance: {
            accuracy: 91.5,
            accuracy_level: '优秀',
            mape: 7.2
          }
        },
        forecast_summary: {
          total_forecast: 195000,
          avg_monthly: 16250,
          growth_rate: 16.87,
          forecast_year: 2025
        },
        monthly_forecast: [
          { month: '2025-01', month_name: '2025年01月', forecast: 15500, lower_bound: 14200, upper_bound: 16800, trend: 13500, seasonal: 2000, confidence: 80 },
          { month: '2025-02', month_name: '2025年02月', forecast: 14200, lower_bound: 12900, upper_bound: 15500, trend: 13600, seasonal: 600, confidence: 80 },
          { month: '2025-03', month_name: '2025年03月', forecast: 12800, lower_bound: 11500, upper_bound: 14100, trend: 13700, seasonal: -900, confidence: 80 },
          { month: '2025-04', month_name: '2025年04月', forecast: 16100, lower_bound: 14800, upper_bound: 17400, trend: 13800, seasonal: 2300, confidence: 80 },
          { month: '2025-05', month_name: '2025年05月', forecast: 13600, lower_bound: 12300, upper_bound: 14900, trend: 13900, seasonal: -300, confidence: 80 },
          { month: '2025-06', month_name: '2025年06月', forecast: 14500, lower_bound: 13200, upper_bound: 15800, trend: 14000, seasonal: 500, confidence: 80 }
        ],
        seasonality_analysis: {
          peak_months: [
            { month: '11月', coefficient: 1.5 },
            { month: '12月', coefficient: 1.3 },
            { month: '1月', coefficient: 1.2 }
          ],
          low_months: [
            { month: '3月', coefficient: 0.7 },
            { month: '4月', coefficient: 0.8 },
            { month: '5月', coefficient: 0.9 }
          ]
        },
        business_insights: [
          '基于Prophet模型的时间序列预测分析',
          '模型验证准确率: 优秀 (91.5%)',
          '2025年预计增长: +16.87%',
          '11月、12月为销量高峰期，建议提前备货',
          '3月、4月为销量低谷期，建议促销刺激'
        ],
        strategic_recommendations: [
          {
            category: '库存管理',
            recommendation: '基于预测置信区间制定安全库存策略',
            impact: '高',
            timeline: '短期'
          },
          {
            category: '营销策略', 
            recommendation: '在11月、12月加大广告投入，抓住自然流量高峰',
            impact: '高',
            timeline: '中期'
          }
        ]
      }
    },

    // 🔧 重要修复：数字格式化方法 - 显示原数据加"条"单位
    formatNumber(value, showSign = false) {
      console.log('🔢 formatNumber输入:', {
        value,
        type: typeof value,
        isNumber: !isNaN(Number(value))
      })
      
      // 🔧 严格验证输入
      if (value === null || value === undefined || value === '') {
        console.log('⚠️ 值为null/undefined/空字符串，返回0条')
        return '0条'
      }
      
      // 🔧 强制转换为数字
      const numValue = Number(value)
      if (isNaN(numValue)) {
        console.log('⚠️ 无法转换为数字:', value, '返回0条')
        return '0条'
      }
      
      console.log('✅ 转换为数字成功:', numValue)
      
      // 🔧 直接显示原始数值，不进行K/M转换
      const absValue = Math.abs(numValue)
      let formatted = Math.round(absValue).toLocaleString() // 格式化数字（添加千分位分隔符）
      
      // 🔧 处理正负号
      if (showSign && numValue !== 0) {
        formatted = (numValue > 0 ? '+' : '-') + formatted
      } else if (numValue < 0) {
        formatted = '-' + formatted
      }
      
      // 🔧 添加"条"单位
      formatted += '条'
      
      console.log('✅ formatNumber最终结果:', formatted)
      return formatted
    },

    // 🔧 新增：专门用于格式化增长率的方法
    formatGrowthRate(rate) {
      if (!rate && rate !== 0) return '+0.0%'
      const sign = rate >= 0 ? '+' : ''
      return `${sign}${Number(rate).toFixed(1)}%`
    },

    // 🔧 新增：专门用于格式化准确率的方法
    formatAccuracy(accuracy) {
      if (!accuracy && accuracy !== 0) return '91.5'
      return Number(accuracy).toFixed(1)
    },

    // 🔧 新增：专门用于格式化系数的方法
    formatCoefficient(value) {
      if (value == null) return '0%'
      return (Number(value) * 100).toFixed(1) + '%'
    },

    // 🔧 新增：专门用于置信区间范围显示（不加单位）
    formatRange(value) {
      if (value === null || value === undefined || value === '') {
        return '0'
      }
      
      const numValue = Number(value)
      if (isNaN(numValue)) {
        return '0'
      }
      
      return Math.round(Math.abs(numValue)).toLocaleString()
    },

    getGrowthClass(rate) {
      if (rate > 0) return 'positive'
      if (rate < 0) return 'negative'
      return 'neutral'
    },

    getSeasonalClass(value) {
      if (value > 0) return 'positive'
      if (value < 0) return 'negative'
      return 'neutral'
    },

    getAccuracyLevel(accuracy) {
      if (accuracy >= 95) return '优秀'
      if (accuracy >= 90) return '良好'
      if (accuracy >= 85) return '中等'
      return '一般'
    },

    // 置信区间显示方法
    getRangeStyle(row) {
      const range = row.upper_bound - row.lower_bound
      const maxRange = Math.max(...(this.prophetData.monthly_forecast || []).map(item => item.upper_bound - item.lower_bound))
      const width = Math.max(10, (range / maxRange) * 100)
      return {
        width: `${width}%`,
        backgroundColor: '#409eff',
        opacity: 0.6
      }
    },

    getPointStyle(row) {
      const range = row.upper_bound - row.lower_bound
      const forecast = row.forecast
      const position = ((forecast - row.lower_bound) / range) * 100
      
      return {
        left: `${Math.max(0, Math.min(100, position))}%`,
        backgroundColor: '#409eff',
        transform: 'translateX(-50%)'
      }
    },

    // 页面操作方法
    async refreshForecast() {
      try {
        this.loading = true
        console.log('🔄 刷新Prophet预测...')
        
        await this.$http.post('/api/analysis/prophet')
        
        setTimeout(() => {
          this.loadProphetData()
        }, 2000)
        
        this.$message.success('预测分析已启动，数据更新中...')
        
      } catch (error) {
        console.error('❌ 刷新失败:', error)
        this.$message.error('刷新失败: ' + error.message)
      } finally {
        this.loading = false
      }
    },

    exportReport() {
      try {
        const dataStr = JSON.stringify(this.prophetData, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        
        const link = document.createElement('a')
        link.href = URL.createObjectURL(dataBlob)
        link.download = `prophet-forecast-${new Date().toISOString().split('T')[0]}.json`
        link.click()
        
        this.$message.success('报告导出成功')
      } catch (error) {
        console.error('导出失败:', error)
        this.$message.error('报告导出失败')
      }
    },

    goBack() {
      this.$router.push('/')
    },

    bindScrollEvent() {
      window.addEventListener('scroll', this.handleScroll)
    },

    handleScroll() {
      this.showBackToTop = window.scrollY > 300
    },

    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  },
  
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll)
    if (this.forecastChartInstance) {
      this.forecastChartInstance.dispose()
    }
    if (this.seasonalChartInstance) {
      this.seasonalChartInstance.dispose()
    }
  }
}
</script>

<style scoped>
.prophet-results {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

/* 页面头部样式 */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px;
  border-radius: 16px;
  margin-bottom: 32px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 16px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.analysis-info {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  font-size: 14px;
  opacity: 0.95;
}

.analysis-info span {
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-buttons .el-button {
  border-radius: 20px;
  padding: 8px 16px;
  font-weight: 500;
}

/* 性能指标卡片样式 */
.performance-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 20px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.performance-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.metric-card {
  padding: 24px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8e8e8;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 100px;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.metric-card.accuracy {
  border-left: 4px solid #67c23a;
}

.metric-card.mae {
  border-left: 4px solid #409eff;
}

.metric-card.rmse {
  border-left: 4px solid #e6a23c;
}

.metric-card.growth {
  border-left: 4px solid #f56c6c;
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.accuracy .card-icon {
  background: linear-gradient(135deg, #67c23a, #85ce61);
  color: white;
}

.mae .card-icon {
  background: linear-gradient(135deg, #409eff, #66b1ff);
  color: white;
}

.rmse .card-icon {
  background: linear-gradient(135deg, #e6a23c, #ebb563);
  color: white;
}

.growth .card-icon {
  background: linear-gradient(135deg, #f56c6c, #f78989);
  color: white;
}

.card-content {
  flex: 1;
}

.card-content h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.card-content .value {
  font-size: 24px;
  font-weight: 700;
  color: #409eff;
  margin: 4px 0;
  line-height: 1;
}

.card-content .desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.2;
}

/* 预测概览样式 */
.forecast-overview {
  margin-bottom: 32px;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.overview-card {
  padding: 28px;
  border-radius: 16px;
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1f5fe;
  transition: all 0.3s ease;
}

.overview-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.card-header i {
  font-size: 20px;
  color: #409eff;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.card-value {
  font-size: 32px;
  font-weight: 700;
  color: #409eff;
  margin-bottom: 8px;
  line-height: 1;
}

.card-range {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.card-range .lower {
  color: #67c23a;
}

.card-range .separator {
  color: #909399;
}

.card-range .upper {
  color: #e6a23c;
}

.card-desc {
  font-size: 14px;
  color: #606266;
}

/* 可视化部分样式 */
.visualization-section {
  margin-bottom: 32px;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.chart-card {
  padding: 24px;
  border-radius: 16px;
  background-color: #ffffff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8e8e8;
}

.chart-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
  text-align: center;
}

.chart {
  height: 400px;
  width: 100%;
}

/* 月度预测表格样式 */
.monthly-forecast {
  margin-bottom: 32px;
}

.forecast-table-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.forecast-value {
  font-weight: 600;
  color: #409eff;
}

.confidence-range {
  font-size: 12px;
  color: #606266;
}

.trend-value, .seasonal-value {
  font-weight: 600;
}

.trend-value.positive, .seasonal-value.positive {
  color: #67c23a;
}

.trend-value.negative, .seasonal-value.negative {
  color: #f56c6c;
}

.forecast-range {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.range-bar {
  position: relative;
  width: 100px;
  height: 8px;
  background: #f5f7fa;
  border-radius: 4px;
}

.range-fill {
  position: absolute;
  height: 100%;
  border-radius: 4px;
  top: 0;
}

.range-point {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #303133;
  border-radius: 50%;
  top: 2px;
  transform: translateX(-50%);
}

.range-label {
  font-size: 11px;
  color: #909399;
}

/* 趋势分析样式 */
.trend-analysis {
  margin-bottom: 32px;
}

.trend-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.trend-card {
  padding: 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8e8e8;
  text-align: center;
}

.trend-year {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.trend-level {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.level-bar {
  flex: 1;
  height: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
}

.level-fill {
  height: 100%;
  background: linear-gradient(90deg, #67c23a, #409eff);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.level-value {
  font-size: 14px;
  font-weight: 600;
  color: #409eff;
}

.trend-desc {
  font-size: 12px;
  color: #909399;
}

/* 季节性分析样式 */
.seasonality-section {
  margin-bottom: 32px;
}

.seasonality-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.peak-months, .low-months {
  padding: 24px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.peak-months h3, .low-months h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

.months-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.month-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.month-item.peak {
  background: linear-gradient(135deg, #f0f9ff 0%, #e8f5e8 100%);
  border: 1px solid #67c23a;
}

.month-item.low {
  background: linear-gradient(135deg, #fff7ed 0%, #fef2f2 100%);
  border: 1px solid #f56c6c;
}

.month-name {
  font-weight: 600;
  color: #303133;
}

.month-impact {
  font-weight: 600;
}

.month-item.peak .month-impact {
  color: #67c23a;
}

.month-item.low .month-impact {
  color: #f56c6c;
}

/* 商业洞察样式 */
.insights-section {
  margin-bottom: 32px;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.insight-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%);
  border: 1px solid #e1f5fe;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.insight-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.insight-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409eff, #66b1ff);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  flex-shrink: 0;
}

.insight-content {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
  color: #606266;
}

/* 战略建议样式 */
.recommendations-section {
  margin-bottom: 32px;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.recommendation-card {
  padding: 24px;
  border-radius: 16px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e8e8e8;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.recommendation-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.recommendation-card.impact-高 {
  border-left: 4px solid #f56c6c;
}

.recommendation-card.impact-中 {
  border-left: 4px solid #e6a23c;
}

.recommendation-card.impact-低 {
  border-left: 4px solid #67c23a;
}

.rec-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.rec-category {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.rec-category i {
  font-size: 18px;
  color: #409eff;
}

.rec-meta {
  display: flex;
  gap: 8px;
}

.impact-badge, .timeline-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.impact-badge.impact-高 {
  background: #fef0f0;
  color: #f56c6c;
}

.impact-badge.impact-中 {
  background: #fdf6ec;
  color: #e6a23c;
}

.impact-badge.impact-低 {
  background: #f0f9ff;
  color: #409eff;
}

.timeline-badge {
  background: #f5f7fa;
  color: #909399;
}

.rec-content {
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
}

/* 回到顶部按钮 */
.scroll-to-top {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #409eff, #66b1ff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
  z-index: 1000;
}

.scroll-to-top:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(64, 158, 255, 0.4);
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .performance-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .trend-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .recommendations-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .prophet-results {
    padding: 12px;
  }
  
  .page-header {
    padding: 20px;
  }
  
  .page-header h1 {
    font-size: 24px;
  }
  
  .analysis-info {
    flex-direction: column;
    gap: 8px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .performance-cards,
  .overview-cards,
  .trend-cards,
  .seasonality-grid,
  .insights-grid {
    grid-template-columns: 1fr;
  }
  
  .metric-card {
    padding: 16px;
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .chart {
    height: 300px;
  }
}
</style>