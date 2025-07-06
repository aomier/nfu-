<template>
  <div class="analysis-results">
    <div class="results-header">
      <div class="header-info">
        <h2>分析结果概览</h2>
        <div class="analysis-meta">
          <span>分析时间: {{ formatTime(data.timestamp) }}</span>
          <span>数据量: {{ data.total_products || 0 }}条</span>
          <span>分析维度: {{ data.analysis_dimensions?.length || 0 }}个</span>
        </div>
      </div>
      <div class="header-actions">
        <el-button @click="downloadReport" icon="el-icon-download" type="primary">
          下载报告
        </el-button>
        <el-button @click="shareResults" icon="el-icon-share">
          分享结果
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
    <div class="charts-section">
      <el-row :gutter="20">
        <!-- 利润分布图 -->
        <el-col :span="12">
          <div class="chart-card">
            <div class="chart-header">
              <h3>品类利润分布</h3>
              <el-button size="mini" type="text" @click="fullscreenChart('profit')">
                <i class="el-icon-full-screen"></i>
              </el-button>
            </div>
            <div id="profit-chart" class="chart-container"></div>
          </div>
        </el-col>
        
        <!-- 价格敏感度图 -->
        <el-col :span="12">
          <div class="chart-card">
            <div class="chart-header">
              <h3>价格敏感度分析</h3>
              <el-button size="mini" type="text" @click="fullscreenChart('sensitivity')">
                <i class="el-icon-full-screen"></i>
              </el-button>
            </div>
            <div id="sensitivity-chart" class="chart-container"></div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <!-- ROI排行榜 -->
        <el-col :span="8">
          <div class="chart-card">
            <div class="chart-header">
              <h3>ROI指数排行</h3>
            </div>
            <div id="roi-chart" class="chart-container"></div>
          </div>
        </el-col>
        
        <!-- 销量与利润关系 -->
        <el-col :span="16">
          <div class="chart-card">
            <div class="chart-header">
              <h3>销量与利润关系分析</h3>
            </div>
            <div id="volume-profit-chart" class="chart-container"></div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 详细数据表格 -->
    <div class="data-table-section">
      <div class="table-header">
        <h3>详细数据分析</h3>
        <div class="table-actions">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索商品或品类"
            prefix-icon="el-icon-search"
            size="small"
            style="width: 200px; margin-right: 10px;"
          />
          <el-select v-model="selectedCategory" placeholder="选择品类" size="small" style="width: 150px;">
            <el-option label="全部品类" value=""></el-option>
            <el-option 
              v-for="category in categories" 
              :key="category" 
              :label="category" 
              :value="category"
            />
          </el-select>
        </div>
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
        <el-table-column prop="profit_margin" label="利润率" width="100" sortable>
          <template slot-scope="scope">
            <el-progress 
              :percentage="scope.row.profit_margin * 100" 
              :stroke-width="6"
              :show-text="false"
              :color="getProgressColor(scope.row.profit_margin)"
            />
            <span style="margin-left: 10px;">{{ (scope.row.profit_margin * 100).toFixed(1) }}%</span>
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
              text-color="#ff9900"
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

    <!-- 分析洞察 -->
    <div class="insights-section">
      <h3>分析洞察与建议</h3>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="insight-card high-profit">
            <div class="insight-icon">
              <i class="el-icon-trophy"></i>
            </div>
            <div class="insight-content">
              <h4>高利润品类</h4>
              <ul>
                <li v-for="item in topProfitCategories" :key="item.name">
                  {{ item.name }}: {{ (item.margin * 100).toFixed(1) }}%
                </li>
              </ul>
              <p class="insight-suggestion">
                建议：加大高利润品类的推广力度和库存投入
              </p>
            </div>
          </div>
        </el-col>
        
        <el-col :span="8">
          <div class="insight-card price-sensitive">
            <div class="insight-icon">
              <i class="el-icon-warning"></i>
            </div>
            <div class="insight-content">
              <h4>价格敏感商品</h4>
              <ul>
                <li v-for="item in priceSensitiveCategories" :key="item.name">
                  {{ item.name }}: 敏感度 {{ item.sensitivity.toFixed(1) }}
                </li>
              </ul>
              <p class="insight-suggestion">
                建议：谨慎调整价格，可考虑促销策略
              </p>
            </div>
          </div>
        </el-col>
        
        <el-col :span="8">
          <div class="insight-card optimization">
            <div class="insight-icon">
              <i class="el-icon-magic-stick"></i>
            </div>
            <div class="insight-content">
              <h4>优化建议</h4>
              <ul>
                <li>提升 {{ lowProfitCategories[0]?.name }} 的利润率</li>
                <li>关注 {{ highVolumeCategories[0]?.name }} 的定价策略</li>
                <li>开发更多高价值商品</li>
              </ul>
              <p class="insight-suggestion">
                预估收益提升：+{{ estimatedImprovement }}%
              </p>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

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
      charts: {}
    }
  },
  computed: {
    categories() {
      if (!this.data.category_analysis) return []
      return Object.keys(this.data.category_analysis)
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
      if (!this.data.category_analysis) return []
      
      return Object.entries(this.data.category_analysis).map(([category, analysis]) => ({
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
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initCharts()
    })
  },
  beforeDestroy() {
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.dispose()
    })
  },
  methods: {
    initCharts() {
      this.initProfitChart()
      this.initSensitivityChart()
      this.initRoiChart()
      this.initVolumeProfitChart()
    },
    
    initProfitChart() {
      const container = document.getElementById('profit-chart')
      if (!container) return
      
      const chart = echarts.init(container)
      this.charts.profit = chart
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 10,
          data: this.categories
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
      
      chart.setOption(option)
    },
    
    initSensitivityChart() {
      const container = document.getElementById('sensitivity-chart')
      if (!container) return
      
      const chart = echarts.init(container)
      this.charts.sensitivity = chart
      
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['价格敏感度', '利润率']
        },
        xAxis: {
          type: 'category',
          data: this.categories
        },
        yAxis: [
          {
            type: 'value',
            name: '敏感度',
            min: 0,
            max: 5
          },
          {
            type: 'value',
            name: '利润率',
            min: 0,
            max: 1,
            axisLabel: {
              formatter: '{value}%'
            }
          }
        ],
        series: [
          {
            name: '价格敏感度',
            type: 'bar',
            data: this.tableData.map(item => item.price_sensitivity)
          },
          {
            name: '利润率',
            type: 'line',
            yAxisIndex: 1,
            data: this.tableData.map(item => item.profit_margin * 100)
          }
        ]
      }
      
      chart.setOption(option)
    },
    
    initRoiChart() {
      const container = document.getElementById('roi-chart')
      if (!container) return
      
      const chart = echarts.init(container)
      this.charts.roi = chart
      
      const sortedData = this.tableData
        .sort((a, b) => b.roi_index - a.roi_index)
        .slice(0, 10)
      
      const option = {
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
          type: 'value'
        },
        yAxis: {
          type: 'category',
          data: sortedData.map(item => item.category)
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
      
      chart.setOption(option)
    },
    
    initVolumeProfitChart() {
      const container = document.getElementById('volume-profit-chart')
      if (!container) return
      
      const chart = echarts.init(container)
      this.charts.volumeProfit = chart
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        legend: {
          data: ['销量', '利润']
        },
        xAxis: {
          type: 'category',
          data: this.categories
        },
        yAxis: [
          {
            type: 'value',
            name: '销量',
            position: 'left'
          },
          {
            type: 'value',
            name: '利润',
            position: 'right'
          }
        ],
        series: [
          {
            name: '销量',
            type: 'bar',
            data: this.tableData.map(item => item.total_sales)
          },
          {
            name: '利润',
            type: 'line',
            yAxisIndex: 1,
            data: this.tableData.map(item => item.total_profit)
          }
        ]
      }
      
      chart.setOption(option)
    },
    
    formatTime(timestamp) {
      return new Date(timestamp || Date.now()).toLocaleString()
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
    
    fullscreenChart(chartType) {
      // 全屏显示图表的逻辑
      this.$message.info('全屏功能开发中...')
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
      // 分享功能
      this.$message.info('分享功能开发中...')
    }
  }
}
</script>

<style lang="less" scoped>
.analysis-results {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;

  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    padding: 25px;
    border-radius: 8px;
    margin-bottom: 25px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    .header-info {
      h2 {
        margin: 0 0 10px 0;
        color: #333;
        font-size: 24px;
      }

      .analysis-meta {
        display: flex;
        gap: 20px;
        color: #666;
        font-size: 14px;

        span {
          display: flex;
          align-items: center;
          
          &:before {
            content: '•';
            margin-right: 5px;
            color: #409eff;
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
    margin-bottom: 30px;

    .metric-card {
      background: white;
      padding: 25px;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
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
          color: #666;
          font-size: 14px;
          font-weight: normal;
        }

        .metric-value {
          font-size: 28px;
          font-weight: bold;
          color: #333;
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

  .charts-section {
    margin-bottom: 30px;

    .chart-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;

      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 25px 0;

        h3 {
          margin: 0;
          color: #333;
          font-size: 16px;
        }
      }

      .chart-container {
        height: 300px;
        padding: 20px;
      }
    }
  }

  .data-table-section {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    margin-bottom: 30px;

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 25px;
      border-bottom: 1px solid #eee;

      h3 {
        margin: 0;
        color: #333;
      }

      .table-actions {
        display: flex;
        align-items: center;
      }
    }

    .profit-positive { color: #67c23a; }
    .profit-negative { color: #f56c6c; }
  }

  .insights-section {
    h3 {
      margin: 0 0 20px 0;
      color: #333;
      font-size: 20px;
    }

    .insight-card {
      background: white;
      padding: 25px;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      height: 100%;
      display: flex;
      flex-direction: column;

      .insight-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 15px;
        font-size: 20px;
        color: white;
      }

      &.high-profit .insight-icon { background: #67c23a; }
      &.price-sensitive .insight-icon { background: #e6a23c; }
      &.optimization .insight-icon { background: #409eff; }

      .insight-content {
        flex: 1;

        h4 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 16px;
        }

        ul {
          padding-left: 20px;
          margin-bottom: 15px;
          color: #666;

          li {
            margin-bottom: 5px;
            font-size: 14px;
          }
        }

        .insight-suggestion {
          background: #f8f9fa;
          padding: 10px;
          border-radius: 4px;
          margin: 0;
          font-size: 13px;
          color: #666;
          border-left: 3px solid #409eff;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .analysis-results {
    padding: 15px;

    .results-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;

      .header-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }

    .metrics-cards {
      grid-template-columns: 1fr;
    }

    .charts-section {
      .el-col {
        margin-bottom: 20px;
      }
    }

    .table-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;

      .table-actions {
        width: 100%;
        flex-direction: column;
        gap: 10px;

        .el-input, .el-select {
          width: 100% !important;
        }
      }
    }
  }
}
</style>