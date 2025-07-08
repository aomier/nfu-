<template>
  <div class="analysis-results" :style="containerStyle">
    <!-- 加载状态指示器 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载分析数据...</p>
    </div>
    
    <!-- 如果有错误则显示 -->
    <div v-else-if="error" class="error-container">
      <i class="el-icon-warning-outline"></i>
      <p>{{ error }}</p>
      <el-button type="primary" @click="loadAnalysisData">重试</el-button>
    </div>

    <!-- 正常内容区，仅在数据加载完成后显示 -->
    <template v-else>
      <!-- 头部区域 -->
      <div class="results-header">
        <div class="header-info">
          <h2>📊 利润分析结果</h2>
          <div class="analysis-meta">
            <span>分析时间: {{ formatTime(data.timestamp) }}</span>
            <span>数据量: {{ formatNumber(data.total_products || 0) }}条</span>
            <span>分析维度: {{ data.analysis_dimensions?.length || 0 }}个</span>
          </div>
        </div>
        <div class="header-actions">
          <el-button @click="downloadReport" icon="el-icon-download" type="primary" size="small">
            下载报告
          </el-button>
          <el-button @click="shareResults" icon="el-icon-share" type="success" size="small">
            分享结果
          </el-button>
          <el-button @click="showAiAnalysis" icon="el-icon-cpu" type="info" size="small" class="ai-analysis-btn">
            <i class="ai-icon">🤖</i> AI分析
          </el-button>
        </div>
      </div>

      <!-- 核心指标卡片 -->
      <div class="metrics-cards">
        <div class="metric-card">
          <div class="metric-icon profit">
            <i class="el-icon-money"></i>
          </div>
          <div class="metric-content">
            <h3>总利润</h3>
            <div class="metric-value">¥{{ formatNumber(data.summary?.total_profit || 0) }}</div>
            <div class="metric-change positive">+12.5%</div>
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-icon revenue">
            <i class="el-icon-shopping-cart-2"></i>
          </div>
          <div class="metric-content">
            <h3>总销售额</h3>
            <div class="metric-value">¥{{ formatNumber(data.summary?.total_revenue || 0) }}</div>
            <div class="metric-change positive">+8.3%</div>
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-icon margin">
            <i class="el-icon-pie-chart"></i>
          </div>
          <div class="metric-content">
            <h3>平均利润率</h3>
            <div class="metric-value">{{ ((data.summary?.avg_profit_margin || 0) * 100).toFixed(1) }}%</div>
            <div class="metric-change negative">-2.1%</div>
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-icon products">
            <i class="el-icon-goods"></i>
          </div>
          <div class="metric-content">
            <h3>商品数量</h3>
            <div class="metric-value">{{ formatNumber(data.total_products || 0) }}</div>
            <div class="metric-change positive">+156</div>
          </div>
        </div>
      </div>

      <!-- 分析图表区域 -->
      <div class="screen-body">
        <!-- 左侧图表 -->
        <section class="screen-left">
          <div class="chart-panel" :class="{ fullscreen: fullScreenStatus.profit }">
            <div class="panel-header">
              <h3>品类利润分布</h3>
              <div class="resize">
                <span @click="changeSize('profit')" :class="['iconfont', fullScreenStatus.profit ? 'el-icon-minus' : 'el-icon-full-screen']"></span>
              </div>
            </div>
            <div id="profit-chart" class="chart-container"></div>
          </div>
          
          <div class="chart-panel" :class="{ fullscreen: fullScreenStatus.sensitivity }">
            <div class="panel-header">
              <h3>价格敏感度分析</h3>
              <div class="resize">
                <span @click="changeSize('sensitivity')" :class="['iconfont', fullScreenStatus.sensitivity ? 'el-icon-minus' : 'el-icon-full-screen']"></span>
              </div>
            </div>
            <div id="sensitivity-chart" class="chart-container"></div>
          </div>
        </section>
        
        <!-- 右侧图表 -->
        <section class="screen-right">
          <div class="chart-panel" :class="{ fullscreen: fullScreenStatus.roi }">
            <div class="panel-header">
              <h3>ROI指数排行</h3>
              <div class="resize">
                <span @click="changeSize('roi')" :class="['iconfont', fullScreenStatus.roi ? 'el-icon-minus' : 'el-icon-full-screen']"></span>
              </div>
            </div>
            <div id="roi-chart" class="chart-container"></div>
          </div>
          
          <div class="chart-panel" :class="{ fullscreen: fullScreenStatus.volumeProfit }">
            <div class="panel-header">
              <h3>销量与利润关系分析</h3>
              <div class="resize">
                <span @click="changeSize('volumeProfit')" :class="['iconfont', fullScreenStatus.volumeProfit ? 'el-icon-minus' : 'el-icon-full-screen']"></span>
              </div>
            </div>
            <div id="volume-profit-chart" class="chart-container"></div>
          </div>
        </section>
      </div>

      <!-- 详细数据表格 -->
      <div class="data-table-section" :class="{ fullscreen: fullScreenStatus.table }">
        <div class="panel-header">
          <h3>详细数据分析</h3>
          <div class="resize">
            <span @click="changeSize('table')" :class="['iconfont', fullScreenStatus.table ? 'el-icon-minus' : 'el-icon-full-screen']"></span>
          </div>
        </div>
        
        <div class="table-content">
          <div class="table-controls">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索商品或品类"
              prefix-icon="el-icon-search"
              size="small"
            />
            <el-select v-model="selectedCategory" placeholder="选择品类" size="small">
              <el-option label="全部品类" value=""></el-option>
              <el-option 
                v-for="category in categories" 
                :key="category" 
                :label="category" 
                :value="category"
              />
            </el-select>
          </div>
          
          <el-table 
            :data="filteredTableData" 
            height="400" 
            stripe
            :default-sort="{prop: 'total_profit', order: 'descending'}"
          >
            <el-table-column prop="category" label="品类" width="120" fixed="left">
              <template slot-scope="scope">
                <el-tag size="small">{{ scope.row.category }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="total_sales" label="销量" width="100" sortable>
              <template slot-scope="scope">
                {{ formatNumber(scope.row.total_sales) }}
              </template>
            </el-table-column>
            <el-table-column prop="total_revenue" label="销售额" width="120" sortable>
              <template slot-scope="scope">
                ¥{{ formatNumber(scope.row.total_revenue) }}
              </template>
            </el-table-column>
            <el-table-column prop="total_profit" label="总利润" width="120" sortable>
              <template slot-scope="scope">
                <span :class="{'profit-positive': scope.row.total_profit > 0, 'profit-negative': scope.row.total_profit < 0}">
                  ¥{{ formatNumber(scope.row.total_profit) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="profit_margin" label="利润率" width="120" sortable>
              <template slot-scope="scope">
                <el-progress 
                  :percentage="scope.row.profit_margin * 100" 
                  :stroke-width="6"
                  :show-text="false"
                  :color="getProgressColor(scope.row.profit_margin)"
                />
                <span class="progress-label">{{ (scope.row.profit_margin * 100).toFixed(1) }}%</span>
              </template>
            </el-table-column>
            <el-table-column prop="avg_price" label="平均单价" width="100" sortable>
              <template slot-scope="scope">
                ¥{{ scope.row.avg_price?.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="price_sensitivity" label="价格敏感度" width="120" sortable>
              <template slot-scope="scope">
                <el-rate
                  v-model="scope.row.price_sensitivity"
                  :max="5"
                  disabled
                  show-score
                  text-color="#00BFFF"
                  score-template="{value}"
                />
              </template>
            </el-table-column>
            <el-table-column prop="roi_index" label="ROI指数" width="100" sortable>
              <template slot-scope="scope">
                <el-tag 
                  :type="getRoiTagType(scope.row.roi_index)"
                  size="small"
                >
                  {{ scope.row.roi_index?.toFixed(2) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 分析洞察 -->
      <div class="insights-grid">
        <div class="insight-card high-profit" :class="{ fullscreen: fullScreenStatus.highProfit }">
          <div class="panel-header">
            <h3><i class="el-icon-trophy"></i> 高利润品类</h3>
            <div class="resize">
              <span @click="changeSize('highProfit')" :class="['iconfont', fullScreenStatus.highProfit ? 'el-icon-minus' : 'el-icon-full-screen']"></span>
            </div>
          </div>
          <div class="insight-content">
            <ul>
              <li v-for="item in topProfitCategories" :key="item.name">
                {{ item.name }}: <span class="highlight">{{ (item.margin * 100).toFixed(1) }}%</span>
              </li>
            </ul>
            <p class="insight-suggestion">
              建议：加大高利润品类的推广力度和库存投入
            </p>
          </div>
        </div>
        
        <div class="insight-card price-sensitive" :class="{ fullscreen: fullScreenStatus.priceSensitive }">
          <div class="panel-header">
            <h3><i class="el-icon-warning"></i> 价格敏感商品</h3>
            <div class="resize">
              <span @click="changeSize('priceSensitive')" :class="['iconfont', fullScreenStatus.priceSensitive ? 'el-icon-minus' : 'el-icon-full-screen']"></span>
            </div>
          </div>
          <div class="insight-content">
            <ul>
              <li v-for="item in priceSensitiveCategories" :key="item.name">
                {{ item.name }}: 敏感度 <span class="highlight">{{ item.sensitivity.toFixed(1) }}</span>
              </li>
            </ul>
            <p class="insight-suggestion">
              建议：谨慎调整价格，可考虑促销策略
            </p>
          </div>
        </div>
        
        <div class="insight-card optimization" :class="{ fullscreen: fullScreenStatus.optimization }">
          <div class="panel-header">
            <h3><i class="el-icon-magic-stick"></i> 优化建议</h3>
            <div class="resize">
              <span @click="changeSize('optimization')" :class="['iconfont', fullScreenStatus.optimization ? 'el-icon-minus' : 'el-icon-full-screen']"></span>
            </div>
          </div>
          <div class="insight-content">
            <ul>
              <li>提升 <span class="highlight">{{ lowProfitCategories[0]?.name }}</span> 的利润率</li>
              <li>关注 <span class="highlight">{{ highVolumeCategories[0]?.name }}</span> 的定价策略</li>
              <li>开发更多高价值商品</li>
            </ul>
            <p class="insight-suggestion">
              预估收益提升：<span class="highlight">+{{ estimatedImprovement }}%</span>
            </p>
          </div>
        </div>
      </div>

      <!-- AI分析卡片 -->
      <div class="ai-analysis-card" v-if="showAiCard" @click.self="showAiCard = false">
        <div class="ai-card-container" @click.stop>
          <div class="ai-card-header">
            <div class="ai-title">
              <div class="ai-avatar">🤖</div>
              <div class="ai-title-text">
                <h3>AI智能分析</h3>
                <p>基于您的数据生成专业洞察</p>
              </div>
            </div>
            <div class="ai-actions">
              <button 
                class="ai-btn refresh-btn" 
                @click="generateAiAnalysis" 
                :disabled="aiLoading" 
                title="重新分析"
              >
                <span class="btn-icon" :class="{'spinning': aiLoading}">🔄</span>
              </button>
              <button 
                class="ai-btn close-btn" 
                @click="showAiCard = false" 
                title="关闭分析"
              >
                <span class="btn-icon">✕</span>
              </button>
            </div>
          </div>
          
          <div class="ai-card-content">
            <div v-if="aiLoading" class="ai-loading">
              <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
              </div>
              <p class="ai-status-text">AI正在思考中...</p>
            </div>
            
            <div v-else-if="aiError" class="ai-error">
              <div class="error-icon">⚠️</div>
              <h4>分析失败</h4>
              <p>{{ aiError }}</p>
              <button class="retry-btn" @click="generateAiAnalysis">重新分析</button>
            </div>
            
            <div v-else-if="aiResult" class="ai-result">
              <div class="ai-result-content" ref="aiResultRef">
                <div class="streaming-text" v-html="streamingHtml"><span class="cursor" v-if="isTyping">|</span></div>
              </div>
            </div>
            
            <div v-else class="ai-welcome">
              <div class="welcome-icon">✨</div>
              <h4>准备开始分析</h4>
              <p>点击刷新按钮开始AI分析</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { mapState } from 'vuex'
import { getThemeValue } from '@/utils/theme_utils'
import { getAIAnalysis } from '@/services/aiService' // 导入AI服务
import { getAIAnalysisStream } from '@/services/aiService'

export default {
  name: 'AnalysisResults',
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      searchKeyword: '',
      selectedCategory: '',
      charts: {},
      fullScreenStatus: {
        profit: false,
        sensitivity: false,
        roi: false,
        volumeProfit: false,
        table: false,
        highProfit: false,
        priceSensitive: false,
        optimization: false
      },
      loading: true,
      error: null,
      localData: null,
      
      // 新增AI分析相关属性
      showAiCard: false,
      aiLoading: false,
      aiResult: '',
      aiError: null,
      displayedResult: '',
      isTyping: false,
      typingSpeed: 50 // 打字机效果速度（毫秒）
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
    categories() {
      if (!this.localData || !this.localData.category_analysis) return []
      return Object.keys(this.localData.category_analysis)
    },
    
    filteredTableData() {
      let data = this.tableData
      
      if (this.searchKeyword) {
        data = data.filter(item => 
          item.category.toLowerCase().includes(this.searchKeyword.toLowerCase())
        )
      }
      
      if (this.selectedCategory) {
        data = data.filter(item => item.category === this.selectedCategory)
      }
      
      return data
    },
    
    tableData() {
      if (!this.localData || !this.localData.category_analysis) return []
      
      return Object.entries(this.localData.category_analysis).map(([category, analysis]) => ({
        category,
        total_sales: analysis.销量,
        total_revenue: analysis.销售额,
        total_profit: analysis.总利润,
        profit_margin: analysis.利润率,
        avg_price: analysis.单价,
        price_sensitivity: Math.random() * 5, // 模拟数据
        roi_index: analysis.总利润 / analysis.销售额
      }))
    },
    
    topProfitCategories() {
      return this.tableData
        .sort((a, b) => b.profit_margin - a.profit_margin)
        .slice(0, 3)
        .map(item => ({ name: item.category, margin: item.profit_margin }))
    },
    
    priceSensitiveCategories() {
      return this.tableData
        .sort((a, b) => b.price_sensitivity - a.price_sensitivity)
        .slice(0, 3)
        .map(item => ({ name: item.category, sensitivity: item.price_sensitivity }))
    },
    
    lowProfitCategories() {
      return this.tableData
        .sort((a, b) => a.profit_margin - b.profit_margin)
        .slice(0, 3)
    },
    
    highVolumeCategories() {
      return this.tableData
        .sort((a, b) => b.total_sales - a.total_sales)
        .slice(0, 3)
    },
    
    estimatedImprovement() {
      return (Math.random() * 15 + 5).toFixed(1)
    },
    
    // 新增计算属性
    formattedAiResult() {
      if (!this.aiResult) return '';
      
      // 将文本中的换行符转换为HTML标签
      return this.aiResult
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // 处理粗体
        .replace(/\*(.*?)\*/g, '<em>$1</em>'); // 处理斜体
    },
    
    streamingHtml() {
      // 关键词高亮
      let html = this.displayedResult
        .replace(/(增长|下降|优化|风险|机会|建议|结论|分析)/g, '<span class="ai-blue">$1</span>');
      return html;
    }
  },
  mounted() {
    this.loadAnalysisData()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.dispose()
    })
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    // 窗口大小变化处理
    handleResize() {
      this.updateCharts()
    },
    
    // 更新所有图表
    updateCharts() {
      Object.values(this.charts).forEach(chart => {
        if (chart) chart.resize()
      })
    },
    
    // 全屏切换
    changeSize(panelName) {
      this.fullScreenStatus[panelName] = !this.fullScreenStatus[panelName]
      this.$nextTick(() => {
        this.updateCharts()
      })
    },
    
    initCharts() {
      try {
        this.initProfitChart()
        this.initSensitivityChart()
        this.initRoiChart()
        this.initVolumeProfitChart()
      } catch (error) {
        console.error('图表初始化失败:', error)
        this.error = '图表初始化失败，请刷新页面重试'
      }
    },
    
    initProfitChart() {
      const container = document.getElementById('profit-chart')
      if (!container) return
      
      const chart = echarts.init(container, this.theme === 'chalk' ? 'dark' : null)
      this.charts.profit = chart
      
      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 10,
          data: this.categories,
          textStyle: {
            color: this.theme === 'chalk' ? 'rgba(255,255,255,0.7)' : '#333'
          }
        },
        series: [
          {
            name: '利润分布',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '30',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: this.tableData.map(item => ({
              value: item.total_profit,
              name: item.category
            }))
          }
        ]
      }
      
      // 添加点击事件
      chart.on('click', (params) => {
        this.handleChartClick('品类利润分布', params);
      });
      
      chart.setOption(option)
    },
    
    initSensitivityChart() {
      const container = document.getElementById('sensitivity-chart')
      if (!container) return
      
      const chart = echarts.init(container, this.theme === 'chalk' ? 'dark' : null)
      this.charts.sensitivity = chart
      
      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['价格敏感度', '利润率'],
          textStyle: {
            color: this.theme === 'chalk' ? 'rgba(255,255,255,0.7)' : '#333'
          }
        },
        xAxis: {
          type: 'category',
          data: this.categories,
          axisLine: {
            lineStyle: {
              color: this.theme === 'chalk' ? 'rgba(255,255,255,0.3)' : '#ccc'
            }
          },
          axisLabel: {
            color: this.theme === 'chalk' ? 'rgba(255,255,255,0.7)' : '#333'
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '敏感度',
            min: 0,
            max: 5,
            axisLine: {
              lineStyle: {
                color: this.theme === 'chalk' ? 'rgba(255,255,255,0.3)' : '#ccc'
              }
            },
            axisLabel: {
              color: this.theme === 'chalk' ? 'rgba(255,255,255,0.7)' : '#333'
            },
            splitLine: {
              lineStyle: {
                color: this.theme === 'chalk' ? 'rgba(255,255,255,0.1)' : '#eee'
              }
            }
          },
          {
            type: 'value',
            name: '利润率',
            min: 0,
            max: 1,
            axisLabel: {
              formatter: '{value}%',
              color: this.theme === 'chalk' ? 'rgba(255,255,255,0.7)' : '#333'
            },
            axisLine: {
              lineStyle: {
                color: this.theme === 'chalk' ? 'rgba(255,255,255,0.3)' : '#ccc'
              }
            },
            splitLine: {
              lineStyle: {
                color: this.theme === 'chalk' ? 'rgba(255,255,255,0.1)' : '#eee'
              }
            }
          }
        ],
        series: [
          {
            name: '价格敏感度',
            type: 'bar',
            data: this.tableData.map(item => item.price_sensitivity),
            itemStyle: {
              color: '#00BFFF'
            }
          },
          {
            name: '利润率',
            type: 'line',
            yAxisIndex: 1,
            data: this.tableData.map(item => item.profit_margin * 100),
            itemStyle: {
              color: '#67c23a'
            }
          }
        ]
      }
      
      // 添加点击事件
      chart.on('click', (params) => {
        this.handleChartClick('价格敏感度分析', params);
      });
      
      chart.setOption(option)
    },
    
    initRoiChart() {
      const container = document.getElementById('roi-chart')
      if (!container) return
      
      const chart = echarts.init(container, this.theme === 'chalk' ? 'dark' : null)
      this.charts.roi = chart
      
      const sortedData = this.tableData
        .sort((a, b) => b.roi_index - a.roi_index)
        .slice(0, 10)
      
      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: this.theme === 'chalk' ? 'rgba(255,255,255,0.3)' : '#ccc'
            }
          },
          axisLabel: {
            color: this.theme === 'chalk' ? 'rgba(255,255,255,0.7)' : '#333'
          },
          splitLine: {
            lineStyle: {
              color: this.theme === 'chalk' ? 'rgba(255,255,255,0.1)' : '#eee'
            }
          }
        },
        yAxis: {
          type: 'category',
          data: sortedData.map(item => item.category),
          axisLine: {
            lineStyle: {
              color: this.theme === 'chalk' ? 'rgba(255,255,255,0.3)' : '#ccc'
            }
          },
          axisLabel: {
            color: this.theme === 'chalk' ? 'rgba(255,255,255,0.7)' : '#333'
          }
        },
        series: [
          {
            name: 'ROI指数',
            type: 'bar',
            data: sortedData.map(item => item.roi_index),
            itemStyle: {
              color: function(params) {
                const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de']
                return colors[params.dataIndex % colors.length]
              }
            }
          }
        ]
      }
      
      // 添加点击事件
      chart.on('click', (params) => {
        this.handleChartClick('ROI指数排行', params);
      });
      
      chart.setOption(option)
    },
    
    initVolumeProfitChart() {
      const container = document.getElementById('volume-profit-chart')
      if (!container) return
      
      const chart = echarts.init(container, this.theme === 'chalk' ? 'dark' : null)
      this.charts.volumeProfit = chart
      
      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        legend: {
          data: ['销量', '利润'],
          textStyle: {
            color: this.theme === 'chalk' ? 'rgba(255,255,255,0.7)' : '#333'
          }
        },
        xAxis: {
          type: 'category',
          data: this.categories,
          axisLine: {
            lineStyle: {
              color: this.theme === 'chalk' ? 'rgba(255,255,255,0.3)' : '#ccc'
            }
          },
          axisLabel: {
            color: this.theme === 'chalk' ? 'rgba(255,255,255,0.7)' : '#333'
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '销量',
            position: 'left',
            axisLine: {
              lineStyle: {
                color: this.theme === 'chalk' ? 'rgba(255,255,255,0.3)' : '#ccc'
              }
            },
            axisLabel: {
              color: this.theme === 'chalk' ? 'rgba(255,255,255,0.7)' : '#333'
            },
            splitLine: {
              lineStyle: {
                color: this.theme === 'chalk' ? 'rgba(255,255,255,0.1)' : '#eee'
              }
            }
          },
          {
            type: 'value',
            name: '利润',
            position: 'right',
            axisLine: {
              lineStyle: {
                color: this.theme === 'chalk' ? 'rgba(255,255,255,0.3)' : '#ccc'
              }
            },
            axisLabel: {
              color: this.theme === 'chalk' ? 'rgba(255,255,255,0.7)' : '#333'
            },
            splitLine: {
              show: false
            }
          }
        ],
        series: [
          {
            name: '销量',
            type: 'bar',
            data: this.tableData.map(item => item.total_sales),
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(0, 191, 255, 0.8)' },
                { offset: 1, color: 'rgba(0, 191, 255, 0.3)' }
              ])
            }
          },
          {
            name: '利润',
            type: 'line',
            yAxisIndex: 1,
            data: this.tableData.map(item => item.total_profit),
            lineStyle: {
              color: '#91cc75',
              width: 3
            },
            symbolSize: 8,
            itemStyle: {
              color: '#91cc75'
            }
          }
        ]
      }
      
      // 添加点击事件
      chart.on('click', (params) => {
        this.handleChartClick('销量与利润关系分析', params);
      });
      
      chart.setOption(option)
    },
    
    formatTime(timestamp) {
      if (!timestamp) return new Date().toLocaleString()
      try {
        return new Date(timestamp).toLocaleString()
      } catch (e) {
        return new Date().toLocaleString()
      }
    },
    
    formatNumber(num) {
      if (!num) return '0'
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    
    getProgressColor(value) {
      if (value > 0.3) return '#67c23a'
      if (value > 0.15) return '#e6a23c'
      return '#f56c6c'
    },
    
    getRoiTagType(value) {
      if (value > 0.2) return 'success'
      if (value > 0.1) return 'warning'
      return 'danger'
    },
    
    downloadReport() {
      const dataStr = JSON.stringify(this.data, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `analysis_report_${Date.now()}.json`
      a.click()
      
      URL.revokeObjectURL(url)
      this.$message.success('报告下载完成')
    },
    
    shareResults() {
      this.$message.info('分享功能开发中...')
    },
    
    async loadAnalysisData() {
      try {
        this.loading = true
        this.error = null
        
        // 使用模拟数据
        this.localData = this.getMockData()
        
        // 将数据同时赋值给 data (这样不需要修改模板)
        // 注意：这是一个非标准的 Vue 操作，但在这种情况下可以解决问题
        this.$set(this, 'data', this.localData)
        
        // 数据加载后再初始化图表
        this.$nextTick(() => {
          this.initCharts()
        })
      } catch (error) {
        console.error('加载分析数据失败:', error)
        this.error = '数据加载失败，请稍后重试'
        this.localData = this.getMockData()
        this.$set(this, 'data', this.localData)
      } finally {
        this.loading = false
      }
    },
    
    getMockData() {
      return {
        timestamp: Date.now(),
        total_products: 5000,
        analysis_dimensions: ['品类', '销量', '利润'],
        summary: {
          total_profit: 1250000,
          total_revenue: 8500000,
          avg_profit_margin: 0.28
        },
        category_analysis: {
          '电子产品': {
            销量: 1200,
            销售额: 3500000,
            总利润: 520000,
            利润率: 0.32,
            单价: 2916.67
          },
          '服装': {
            销量: 2500,
            销售额: 1750000,
            总利润: 350000,
            利润率: 0.20,
            单价: 700
          },
          '家居用品': {
            销量: 1800,
            销售额: 1600000,
            总利润: 240000,
            利润率: 0.15,
            单价: 888.89
          },
          '食品': {
            销量: 3200,
            销售额: 960000,
            总利润: 96000,
            利润率: 0.10,
            单价: 300
          },
          '美妆': {
            销量: 1500,
            销售额: 750000,
            总利润: 187500,
            利润率: 0.25,
            单价: 500
          }
        }
      }
    },
    
    // 新增方法 - 显示整体AI分析
    showAiAnalysis() {
      this.showAiCard = true;
      this.aiResult = '';
      this.aiError = null;
      this.generateAiAnalysis();
    },
    
    // 新增方法 - 处理图表点击事件
    handleChartClick(chartName, params) {
      this.showAiCard = true;
      this.aiResult = '';
      
      // 生成AI分析，传入图表点击的详细信息
      this.generateAiAnalysis(chartName, params);
    },
    
    // 新增方法 - 生成AI分析
    async generateAiAnalysis(chartName, params) {
      try {
        this.aiLoading = true;
        this.aiError = null;
        
        // 构建简化的提示词
        let prompt = `作为数据分析专家，请基于以下数据进行分析并提供具体建议：\n\n`;
        
        // 添加基本数据信息
        prompt += `- 总利润：¥${this.formatNumber(this.data?.summary?.total_profit || 0)}\n`;
        prompt += `- 总销售额：¥${this.formatNumber(this.data?.summary?.total_revenue || 0)}\n`;
        prompt += `- 平均利润率：${((this.data?.summary?.avg_profit_margin || 0) * 100).toFixed(1)}%\n`;
        
        if (chartName && params) {
          prompt += `\n用户点击了【${chartName}】图表中的数据：${params.name || '未命名'}\n`;
        }
        
        prompt += `\n请给出数据分析和3点具体可行的优化建议。回答控制在150字以内。`;
        
        console.log("发送AI请求");
        
        // 调用API获取分析结果
        const result = await getAIAnalysis(prompt);
        this.aiResult = result;
        console.log("AI分析结果已更新");
      } catch (error) {
        console.error('AI分析生成失败:', error);
        this.aiError = error.message || '生成分析失败，请稍后重试';
      } finally {
        this.aiLoading = false;
      }
    },
    
    async generateAiAnalysis() {
      try {
        this.aiLoading = true;
        this.aiError = null;
        this.aiResult = '';
        this.displayedResult = '';
        this.isTyping = false;

        // 预设词与格式优化
        const preset = `
【分析要求】
1. 以专业数据分析师身份，使用简洁有逻辑的语言输出。
2. 结构化输出：先给出结论摘要，再分点详细分析，最后给出可执行建议。
3. 重点用“蓝色高亮”词语（如增长、下降、优化、风险、机会等）。

【数据概览】
- 总利润：¥1,250,000（+12.5%）
- 总销售额：¥8,500,000（+8.3%）
- 平均利润率：28.0%（-2.1%）
- 商品数量：5,000

【输出格式】
【结论摘要】
...
【详细分析】
1.
2.
3.
【优化建议】
- 
- 
- 
`;

        await getAIAnalysisStream(preset, (newText, fullContent) => {
          this.aiResult = fullContent;
          this.typewriterEffect();
        });

      } catch (error) {
        this.aiError = error.message || '分析失败，请稍后重试';
        this.isTyping = false;
      } finally {
        this.aiLoading = false;
      }
    },
    
    // 打字机效果
    typewriterEffect() {
      if (this.displayedResult.length < this.aiResult.length) {
        this.displayedResult = this.aiResult.substring(0, this.displayedResult.length + 1);
        setTimeout(() => {
          this.typewriterEffect();
        }, this.typingSpeed);
      } else {
        this.isTyping = false;
      }
    }
  }
}
</script>

<style lang="less" scoped>
// 全屏样式的定义
.fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  z-index: 9999;
  background-color: #0A1929;
  
  .panel-header {
    padding: 20px 30px !important;
  }
  
  .chart-container {
    height: calc(100% - 70px) !important;
  }
  
  .insight-content {
    height: calc(100% - 70px) !important;
    padding: 20px 30px !important;
  }
  
  .table-content {
    height: calc(100% - 70px) !important;
    padding: 20px 30px !important;
  }
}

.analysis-results {
  padding: 20px;
  background-color: #0A1929;
  color: #fff;
  min-height: 100vh;
  box-sizing: border-box;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(10, 25, 41, 0.7);
  border: 1px solid rgba(0, 191, 255, 0.2);
  border-radius: 8px;
  padding: 20px 25px;
  margin-bottom: 20px;
  box-shadow: 0 0 15px rgba(0, 191, 255, 0.1);

  .header-info {
    h2 {
      margin: 0 0 10px 0;
      color: #ffffff;
      font-size: 24px;
    }

    .analysis-meta {
      display: flex;
      gap: 20px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;

      span {
        display: flex;
        align-items: center;
        
        &:before {
          content: '•';
          margin-right: 5px;
          color: #00BFFF;
        }
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 10px;
  }
}

.metrics-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;

  .metric-card {
    background: rgba(10, 25, 41, 0.7);
    border: 1px solid rgba(0, 191, 255, 0.2);
    border-radius: 8px;
    box-shadow: 0 0 15px rgba(0, 191, 255, 0.1);
    padding: 20px;
    display: flex;
    align-items: center;
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-5px);
    }

    .metric-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20px;
      font-size: 24px;
      color: white;

      &.profit { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      &.revenue { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
      &.margin { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
      &.products { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
    }

    .metric-content {
      flex: 1;

      h3 {
        margin: 0 0 5px 0;
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
        font-weight: normal;
      }

      .metric-value {
        font-size: 28px;
        font-weight: bold;
        color: #ffffff;
        margin-bottom: 5px;
      }

      .metric-change {
        font-size: 12px;
        
        &.positive { color: #67c23a; }
        &.negative { color: #f56c6c; }
      }
    }
  }
}

// 图表布局
.screen-body {
  display: flex;
  margin-bottom: 20px;
  gap: 20px;
  
  .screen-left, 
  .screen-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
}

// 面板通用样式
.chart-panel, .data-table-section, .insight-card {
  background: rgba(10, 25, 41, 0.7);
  border: 1px solid rgba(0, 191, 255, 0.2);
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(0, 191, 255, 0.1);
  overflow: hidden;
  position: relative;
  height: 350px;
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid rgba(0, 191, 255, 0.3);
    background-color: rgba(0, 191, 255, 0.05);
    
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: normal;
      color: #ffffff;
      display: flex;
      align-items: center;
      
      i {
        margin-right: 8px;
        color: #00BFFF;
      }
    }
    
    .resize {
      cursor: pointer;
      
      span {
        font-size: 16px;
        color: rgba(255, 255, 255, 0.7);
        
        &:hover {
          color: #00BFFF;
        }
      }
    }
  }
  
  .chart-container {
    height: calc(100% - 51px);
    width: 100%;
  }
}

// 表格区域
.data-table-section {
  margin-bottom: 20px;
  height: auto;
  
  .table-content {
    padding: 15px;
    
    .table-controls {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
      
      .el-input {
        width: 250px;
        margin-right: 15px;
      }
      
      .el-select {
        width: 180px;
      }
    }
  }
  
  /deep/ .el-table {
    background-color: transparent;
    color: rgba(255, 255, 255, 0.8);
    
    &::before {
      display: none;
    }
    
    th {
      background-color: rgba(0, 191, 255, 0.1);
      border-bottom: 1px solid rgba(0, 191, 255, 0.3);
      
      .cell {
        color: #ffffff;
        font-weight: normal;
      }
    }
    
    td {
      border-bottom: 1px solid rgba(0, 191, 255, 0.1);
      background-color: transparent;
    }
    
    tr:hover > td {
      background-color: rgba(0, 191, 255, 0.05);
    }
    
    .profit-positive {
      color: #67c23a;
    }
    
    .profit-negative {
      color: #f56c6c;
    }
    
    .progress-label {
      margin-left: 10px;
      color: rgba(255, 255, 255, 0.7);
    }
  }
}

// 洞察区域
.insights-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
  
  .insight-card {
    height: 300px;
    
    .insight-content {
      padding: 15px;
      height: calc(100% - 51px);
      overflow-y: auto;
      
      ul {
        padding-left: 20px;
        margin-bottom: 15px;
        color: rgba(255, 255, 255, 0.8);
        
        li {
          margin-bottom: 12px;
          line-height: 1.5;
        }
        
        .highlight {
          color: #00BFFF;
          font-weight: bold;
        }
      }
      
      .insight-suggestion {
        background-color: rgba(0, 191, 255, 0.05);
        border-left: 3px solid #00BFFF;
        padding: 10px;
        color: rgba(255, 255, 255, 0.7);
        margin: 0;
      }
    }
  }
}

// 添加加载和错误状态的样式
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  width: 100%;
  text-align: center;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(0, 191, 255, 0.3);
  border-top: 3px solid #00BFFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

.error-container {
  color: #f56c6c;
}

.error-container i {
  font-size: 48px;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 响应式设计
@media (max-width: 1200px) {
  .screen-body {
    flex-direction: column;
    
    .screen-left,
    .screen-right {
      width: 100%;
    }
  }
  
  .insights-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;

    .analysis-meta {
      flex-direction: column;
      gap: 8px;
    }

    .header-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }

  .metrics-cards {
    grid-template-columns: 1fr;
  }

  .data-table-section {
    .table-content {
      .table-controls {
        flex-direction: column;
        gap: 10px;
        
        .el-input, .el-select {
          width: 100% !important;
          margin-right: 0;
        }
      }
    }
  }
}

// AI分析按钮样式
.ai-analysis-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-weight: 500;
  
  .ai-icon {
    margin-right: 4px;
    font-size: 14px;
  }
  
  &:hover {
    background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
}

// AI分析卡片样式
.ai-analysis-card {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.3s ease-out;
  
  .ai-card-container {
    width: 800px;
    max-width: 90vw;
    max-height: 80vh;
    background: linear-gradient(145deg, #1e2a3a 0%, #2a3441 100%);
    border-radius: 20px;
    box-shadow: 
      0 20px 60px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(255, 255, 255, 0.1);
    overflow: hidden;
    animation: slideUp 0.4s ease-out;
    
    .ai-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 28px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      
      .ai-title {
        display: flex;
        align-items: center;
        
        .ai-avatar {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin-right: 16px;
          backdrop-filter: blur(10px);
        }
        
        .ai-title-text {
          h3 {
            margin: 0;
            color: white;
            font-size: 20px;
            font-weight: 600;
            line-height: 1.2;
          }
          
          p {
            margin: 4px 0 0 0;
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
          }
        }
      }
      
      .ai-actions {
        display: flex;
        gap: 12px;
        
        .ai-btn {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
          
          .btn-icon {
            font-size: 18px;
            line-height: 1;
            transition: transform 0.3s ease;
            
            &.spinning {
              animation: spin 1s linear infinite;
            }
          }
          
          &.refresh-btn:hover .btn-icon:not(.spinning) {
            transform: rotate(180deg);
          }
          
          &.close-btn:hover .btn-icon {
            transform: scale(1.2);
          }
          
          &:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.05);
          }
          
          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }
        }
      }
    }
    
    .ai-card-content {
      height: 500px;
      overflow-y: auto;
      
      .ai-loading {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        
        .typing-indicator {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          
          .typing-dot {
            width: 12px;
            height: 12px;
            background: #667eea;
            border-radius: 50%;
            animation: typing 1.4s infinite ease-in-out;
            
            &:nth-child(1) { animation-delay: -0.32s; }
            &:nth-child(2) { animation-delay: -0.16s; }
            &:nth-child(3) { animation-delay: 0s; }
          }
        }
        
        .ai-status-text {
          color: rgba(255, 255, 255, 0.7);
          font-size: 16px;
          margin: 0;
        }
      }
      
      .ai-error {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        padding: 0 40px;
        text-align: center;
        
        .error-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        h4 {
          color: #ff6b6b;
          margin: 0 0 12px 0;
          font-size: 20px;
        }
        
        p {
          color: rgba(255, 255, 255, 0.7);
          margin: 0 0 24px 0;
          line-height: 1.6;
        }
        
        .retry-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 10px;
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }
        }
      }
      
      .ai-result {
        padding: 32px;
        
        .ai-result-content {
          .streaming-text {
            color: #fff;
            font-family: 'Orbitron', 'Consolas', 'Segoe UI', 'Arial', sans-serif;
            font-size: 18px;
            line-height: 1.9;
            white-space: pre-wrap;
            text-shadow:
              0 0 8px #00bfff,
              0 0 16px #00bfff,
              0 0 32px #00bfff,
              0 0 2px #fff;
            letter-spacing: 0.5px;
            background: linear-gradient(90deg, #00bfff33 0%, #1e90ff11 100%);
            border-radius: 8px;
            padding: 18px 24px;
            box-shadow: 0 0 24px #00bfff44;
            transition: background 0.3s;
          }
        }
      }
      
      .ai-welcome {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        
        .welcome-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        h4 {
          color: white;
          margin: 0 0 12px 0;
          font-size: 20px;
        }
        
        p {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }
      }
    }
  }
}

// 动画定义
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) translateY(50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) translateY(0) scale(1);
  }
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

// 响应式设计
@media (max-width: 768px) {
  .ai-analysis-card {
    .ai-card-container {
      width: 95vw;
      max-height: 85vh;
      border-radius: 16px;
      
      .ai-card-header {
        padding: 20px;
        
        .ai-title {
          .ai-avatar {
            width: 40px;
            height: 40px;
            font-size: 20px;
            margin-right: 12px;
          }
          
          .ai-title-text h3 {
            font-size: 18px;
          }
        }
      }
      
      .ai-card-content {
        height: calc(85vh - 100px);
        
        .ai-result {
          padding: 20px;
          
          .streaming-text {
            font-size: 14px;
          }
        }
      }
    }
  }
}

.ai-blue {
  color: #00bfff;
  font-weight: bold;
  text-shadow: 0 0 8px #00bfff, 0 0 2px #fff;
}
</style>
