<!-- filepath: c:\Users\Mcola.Tech\数据分析\data-view\src\views\AnalysisPage.vue -->
<template>
  <div class="analysis-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>利润与价格敏感度分析</h1>
      <div class="header-actions">
        <button @click="goBack" class="btn-back">
          <i class="iconfont">&#xe6ef;</i>
          返回首页
        </button>
        <button @click="refreshData" class="btn-refresh">
          <i class="iconfont">&#xe6ed;</i>
          刷新数据
        </button>
      </div>
    </div>
    
    <!-- 分析控制面板 -->
    <analysis-control 
      @analysis-complete="onAnalysisComplete"
      @view-results="scrollToCharts"
    />
    
    <!-- 图表展示区域 -->
    <div v-if="hasData" class="charts-container">
      <div class="charts-grid">
        <!-- 利润趋势图 -->
        <div class="chart-item">
          <profit-trend 
            :data="chartData.trend"
            :theme="theme"
          />
        </div>
        
        <!-- 品类排行图 -->
        <div class="chart-item">
          <category-rank 
            :data="chartData.rank"
            :theme="theme"
          />
        </div>
        
        <!-- 价格敏感度分析 -->
        <div class="chart-item">
          <price-sensitivity 
            :data="chartData.sensitivity"
            :theme="theme"
          />
        </div>
        
        <!-- 盈利能力矩阵 -->
        <div class="chart-item">
          <profit-matrix 
            :data="chartData.matrix"
            :theme="theme"
          />
        </div>
        
        <!-- 策略建议图 -->
        <div class="chart-item">
          <strategy-recommendations 
            :data="chartData.strategies"
            :theme="theme"
          />
        </div>
        
        <!-- 综合指标仪表板 -->
        <div class="chart-item">
          <comprehensive-dashboard 
            :data="chartData.dashboard"
            :theme="theme"
          />
        </div>
      </div>
    </div>
    
    <!-- 数据表格 -->
    <div v-if="hasData" class="data-tables">
      <div class="table-container">
        <h3>品类详细分析数据</h3>
        <el-table 
          :data="categoriesData" 
          style="width: 100%"
          :default-sort="{prop: 'profit', order: 'descending'}"
        >
          <el-table-column prop="name" label="品类名称" width="150"></el-table-column>
          <el-table-column prop="profit" label="总利润" width="120" sortable>
            <template slot-scope="scope">
              ${{ formatNumber(scope.row.profit) }}
            </template>
          </el-table-column>
          <el-table-column prop="profit_margin" label="利润率" width="100" sortable>
            <template slot-scope="scope">
              {{ (scope.row.profit_margin * 100).toFixed(1) }}%
            </template>
          </el-table-column>
          <el-table-column prop="sales" label="销量" width="120" sortable>
            <template slot-scope="scope">
              {{ formatNumber(scope.row.sales) }}
            </template>
          </el-table-column>
          <el-table-column prop="price_sensitivity" label="价格敏感度" width="120"></el-table-column>
          <el-table-column prop="roi_index" label="ROI指数" width="100" sortable>
            <template slot-scope="scope">
              {{ scope.row.roi_index.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="策略建议" min-width="200">
            <template slot-scope="scope">
              <el-tag :type="getStrategyTagType(scope.row.strategy_priority)">
                {{ scope.row.strategy_type }}
              </el-tag>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">
                {{ scope.row.recommendation }}
              </p>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    
    <!-- 无数据提示 -->
    <div v-if="!hasData" class="no-data">
      <div class="no-data-content">
        <i class="iconfont no-data-icon">&#xe6eb;</i>
        <h3>暂无分析数据</h3>
        <p>请先点击上方"开始分析"按钮进行数据分析</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import AnalysisControl from '@/components/AnalysisControl'
import analysisApi from '@/api/analysis'

// 分析专用图表组件
import ProfitTrend from '@/components/analysis/ProfitTrend'
import CategoryRank from '@/components/analysis/CategoryRank'
import PriceSensitivity from '@/components/analysis/PriceSensitivity'
import ProfitMatrix from '@/components/analysis/ProfitMatrix'
import StrategyRecommendations from '@/components/analysis/StrategyRecommendations'
import ComprehensiveDashboard from '@/components/analysis/ComprehensiveDashboard'

export default {
  name: 'AnalysisPage',
  components: {
    AnalysisControl,
    ProfitTrend,
    CategoryRank,
    PriceSensitivity,
    ProfitMatrix,
    StrategyRecommendations,
    ComprehensiveDashboard
  },
  data() {
    return {
      hasData: false,
      analysisResults: null,
      chartData: {},
      categoriesData: []
    }
  },
  computed: {
    ...mapState(['theme'])
  },
  mounted() {
    this.loadExistingData()
  },
  methods: {
    async loadExistingData() {
      try {
        const results = await analysisApi.getLatestResults()
        if (results && results.categories) {
          this.processAnalysisResults(results)
        }
      } catch (error) {
        console.log('没有找到已有的分析数据')
      }
    },
    
    onAnalysisComplete(data) {
      console.log('分析完成:', data)
      this.loadExistingData()
    },
    
    async refreshData() {
      await this.loadExistingData()
      this.$message.success('数据已刷新')
    },
    
    processAnalysisResults(results) {
      this.analysisResults = results
      this.hasData = true
      
      // 处理图表数据
      this.chartData = {
        trend: this.processTrendData(results.charts.trend),
        rank: this.processRankData(results.charts.rank),
        sensitivity: this.processSensitivityData(results.categories),
        matrix: this.processMatrixData(results.categories),
        strategies: this.processStrategiesData(results.strategies),
        dashboard: this.processDashboardData(results.basic_stats)
      }
      
      // 处理表格数据
      this.categoriesData = results.categories.map(cat => ({
        ...cat,
        strategy_type: this.findStrategyForCategory(cat.name, results.strategies),
        strategy_priority: this.findPriorityForCategory(cat.name, results.strategies),
        recommendation: this.findRecommendationForCategory(cat.name, results.strategies)
      }))
    },
    
    processTrendData(trendData) {
      // 转换为图表组件需要的格式
      return {
        ...trendData,
        // 添加其他处理逻辑
      }
    },
    
    processRankData(rankData) {
      return rankData.slice(0, 10) // 只显示前10个
    },
    
    processSensitivityData(categories) {
      return categories.map(cat => ({
        name: cat.name,
        elasticity: cat.price_elasticity,
        sensitivity: cat.price_sensitivity
      }))
    },
    
    processMatrixData(categories) {
      return categories.map(cat => ({
        name: cat.name,
        profit_margin: cat.profit_margin,
        sales: cat.sales,
        profit: cat.profit
      }))
    },
    
    processStrategiesData(strategies) {
      return strategies
    },
    
    processDashboardData(basicStats) {
      return basicStats
    },
    
    findStrategyForCategory(categoryName, strategies) {
      const strategy = strategies.find(s => s.category === categoryName)
      return strategy ? strategy.strategy_type : '待分析'
    },
    
    findPriorityForCategory(categoryName, strategies) {
      const strategy = strategies.find(s => s.category === categoryName)
      return strategy ? strategy.priority : 'C级观察'
    },
    
    findRecommendationForCategory(categoryName, strategies) {
      const strategy = strategies.find(s => s.category === categoryName)
      return strategy ? strategy.recommendation : '需要进一步分析'
    },
    
    getStrategyTagType(priority) {
      switch (priority) {
        case 'S级顶级':
          return 'success'
        case 'A+级重点':
        case 'A级重点':
          return 'primary'
        case 'B级关注':
          return 'warning'
        default:
          return 'info'
      }
    },
    
    scrollToCharts() {
      this.$nextTick(() => {
        const chartsContainer = this.$el.querySelector('.charts-container')
        if (chartsContainer) {
          chartsContainer.scrollIntoView({ behavior: 'smooth' })
        }
      })
    },
    
    goBack() {
      this.$router.push('/')
    },
    
    formatNumber(num) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
      }
      return num.toString()
    }
  }
}
</script>

<style lang="less" scoped>
.analysis-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    h1 {
      color: white;
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
      
      button {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        gap: 6px;
        
        &:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
        
        .iconfont {
          font-size: 16px;
        }
      }
    }
  }
  
  .charts-container {
    margin: 32px 0;
    
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 24px;
      
      .chart-item {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s;
        
        &:hover {
          transform: translateY(-4px);
        }
      }
    }
  }
  
  .data-tables {
    margin: 32px 0;
    
    .table-container {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      
      h3 {
        margin: 0 0 20px 0;
        color: #333;
        font-size: 18px;
        font-weight: 600;
      }
    }
  }
  
  .no-data {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    
    .no-data-content {
      text-align: center;
      color: white;
      
      .no-data-icon {
        font-size: 64px;
        opacity: 0.6;
        margin-bottom: 20px;
      }
      
      h3 {
        margin: 0 0 12px 0;
        font-size: 24px;
        font-weight: 600;
      }
      
      p {
        margin: 0;
        font-size: 16px;
        opacity: 0.8;
      }
    }
  }
}
</style>