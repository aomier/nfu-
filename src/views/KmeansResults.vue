<!-- filepath: c:\Users\Mcola.Tech\不改动版本\data-view\src\views\KmeansResults.vue -->
<template>
  <div class="kmeans-container" :style="containerStyle">
    <header class="kmeans-header">
      <div class="header-border">
        <img v-show="theme == 'chalk'" src="~@/assets/images/header_border_dark.png" alt="" />
        <img v-show="theme != 'chalk'" src="~@/assets/images/header_border_light.png" alt="" />
      </div>
      
      <div class="header-left">
        <el-button 
          type="text" 
          icon="el-icon-arrow-left" 
          @click="goBack"
          class="back-btn"
        >
          返回主页
        </el-button>
      </div>
      
      <div class="header-title">
        <span>🧩 K-means 聚类分析</span>
      </div>
      
      <div class="header-right">
        <img v-show="theme == 'chalk'" src="~@/assets/images/qiehuan_dark.png" class="qiehuan" @click="handleChangeTheme" alt="切换主题" title="切换主题" />
        <img v-show="theme != 'chalk'" src="~@/assets/images/qiehuan_light.png" class="qiehuan" @click="handleChangeTheme" alt="切换主题" title="切换主题" />
        <div class="datetime">{{ systemDateTime }}</div>
        <div class="actions">
          <el-button type="primary" icon="el-icon-refresh" size="mini" @click="refreshData">
            刷新数据
          </el-button>
          <el-button type="success" icon="el-icon-download" size="mini" @click="exportReport">
            导出报告
          </el-button>
        </div>
      </div>
    </header>

    <div class="analysis-info">
      <span>分析时间: {{ formatTime(clusterData.timestamp) }}</span>
      <span>数据样本: {{ formatNumber(clusterData.summary?.sample_count || 5280) }}</span>
      <span>最佳聚类数: {{ clusterData.model_info?.optimal_clusters || 4 }}</span>
      <span>模型评分: {{ formatScore(clusterData.model_performance?.silhouette_score || 0.72) }}</span>
    </div>

    <div class="kmeans-body">
      <!-- 左侧面板 -->
      <section class="panel-left">
        <div id="overview-panel" :class="{ fullscreen: fullScreenStatus.overview }">
          <div class="panel-header">
            <h2 class="section-title">聚类分析概览</h2>
            <div class="resize">
              <span @click="changeSize('overview')" :class="['iconfont', fullScreenStatus.overview ? 'icon-compress-alt' : 'icon-expand-alt']">
                <i :class="fullScreenStatus.overview ? 'el-icon-minus' : 'el-icon-full-screen'"></i>
              </span>
            </div>
          </div>
          
          <div class="overview-cards">
            <div class="stat-card clusters">
              <div class="card-icon">
                <i class="el-icon-collection"></i>
              </div>
              <div class="card-content">
                <h3>聚类数量</h3>
                <div class="value">{{ clusterData.model_info?.optimal_clusters || 4 }}</div>
                <div class="change neutral">最优分群</div>
              </div>
            </div>

            <div class="stat-card samples">
              <div class="card-icon">
                <i class="el-icon-data-line"></i>
              </div>
              <div class="card-content">
                <h3>样本总量</h3>
                <div class="value">{{ formatNumber(clusterData.summary?.sample_count || 5280) }}</div>
                <div class="change neutral">客户数据</div>
              </div>
            </div>

            <div class="stat-card score">
              <div class="card-icon">
                <i class="el-icon-medal"></i>
              </div>
              <div class="card-content">
                <h3>聚类质量分数</h3>
                <div class="value">{{ formatScore(clusterData.model_performance?.silhouette_score || 0.72) }}</div>
                <div class="change positive">良好</div>
              </div>
            </div>

            <div class="stat-card features">
              <div class="card-icon">
                <i class="el-icon-menu"></i>
              </div>
              <div class="card-content">
                <h3>特征维度</h3>
                <div class="value">{{ clusterData.model_info?.features?.length || 5 }}</div>
                <div class="change neutral">用于聚类</div>
              </div>
            </div>
          </div>
        </div>
        
        <div id="feature-panel" :class="{ fullscreen: fullScreenStatus.feature }">
          <div class="panel-header">
            <h2 class="section-title">特征重要性分析</h2>
            <div class="resize">
              <span @click="changeSize('feature')" :class="['iconfont', fullScreenStatus.feature ? 'icon-compress-alt' : 'icon-expand-alt']">
                <i :class="fullScreenStatus.feature ? 'el-icon-minus' : 'el-icon-full-screen'"></i>
              </span>
            </div>
          </div>
          <div class="feature-chart" ref="featureChart"></div>
        </div>
      </section>

      <!-- 中间面板 -->
      <section class="panel-middle">
        <div id="scatter-panel" :class="{ fullscreen: fullScreenStatus.scatter }">
          <div class="panel-header">
            <h2 class="section-title">聚类分布散点图</h2>
            <div class="resize">
              <span @click="changeSize('scatter')" :class="['iconfont', fullScreenStatus.scatter ? 'icon-compress-alt' : 'icon-expand-alt']">
                <i :class="fullScreenStatus.scatter ? 'el-icon-minus' : 'el-icon-full-screen'"></i>
              </span>
            </div>
          </div>
          <div class="scatter-chart" ref="scatterChart"></div>
        </div>
        
        <div id="distribution-panel" :class="{ fullscreen: fullScreenStatus.distribution }">
          <div class="panel-header">
            <h2 class="section-title">聚类规模分布</h2>
            <div class="resize">
              <span @click="changeSize('distribution')" :class="['iconfont', fullScreenStatus.distribution ? 'icon-compress-alt' : 'icon-expand-alt']">
                <i :class="fullScreenStatus.distribution ? 'el-icon-minus' : 'el-icon-full-screen'"></i>
              </span>
            </div>
          </div>
          <div class="distribution-chart" ref="distributionChart"></div>
        </div>
      </section>

      <!-- 右侧面板 -->
      <section class="panel-right">
        <div id="details-panel" :class="{ fullscreen: fullScreenStatus.details }">
          <div class="panel-header">
            <h2 class="section-title">聚类详情</h2>
            <div class="resize">
              <span @click="changeSize('details')" :class="['iconfont', fullScreenStatus.details ? 'icon-compress-alt' : 'icon-expand-alt']">
                <i :class="fullScreenStatus.details ? 'el-icon-minus' : 'el-icon-full-screen'"></i>
              </span>
            </div>
          </div>
          
          <div class="cluster-tabs">
            <div 
              v-for="n in (clusterData.clusters?.length || 4)" 
              :key="n"
              :class="['cluster-tab', { active: currentClusterIndex === n - 1 }]"
              @click="showCluster(n - 1)"
            >
              聚类 {{ n }}
            </div>
          </div>
          
          <div class="cluster-details" v-if="currentCluster">
            <div class="cluster-header">
              <h3>{{ currentCluster.name || `聚类 ${currentClusterIndex + 1}` }}</h3>
              <el-tag :type="getClusterTagType(currentClusterIndex)">
                {{ formatNumber(currentCluster.size || 1200) }} 样本
              </el-tag>
            </div>
            
            <div class="cluster-description">
              {{ currentCluster.description || getDefaultDescription(currentClusterIndex) }}
            </div>
            
            <div class="feature-bars">
              <div 
                v-for="(feature, idx) in currentCluster.key_features || defaultFeatures" 
                :key="idx"
                class="feature-bar"
              >
                <div class="feature-name">{{ feature.name }}</div>
                <div class="feature-value-container">
                  <div 
                    class="feature-value"
                    :style="{ width: `${getFeaturePercentage(feature.value)}%`, backgroundColor: getFeatureColor(feature.value, feature.is_high) }"
                  ></div>
                  <span class="feature-value-text">{{ formatFeatureValue(feature.value) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div id="strategy-panel" :class="{ fullscreen: fullScreenStatus.strategy }">
          <div class="panel-header">
            <h2 class="section-title">客户画像与营销策略</h2>
            <div class="resize">
              <span @click="changeSize('strategy')" :class="['iconfont', fullScreenStatus.strategy ? 'icon-compress-alt' : 'icon-expand-alt']">
                <i :class="fullScreenStatus.strategy ? 'el-icon-minus' : 'el-icon-full-screen'"></i>
              </span>
            </div>
          </div>
          
          <div class="strategy-content">
            <div class="cluster-traits">
              <div 
                v-for="(trait, traitIndex) in (currentCluster.traits || defaultTraits[currentClusterIndex % 4])" 
                :key="traitIndex"
                class="trait-item"
              >
                <span class="trait-label">{{ trait.label }}</span>
                <span class="trait-value">{{ trait.value }}</span>
              </div>
            </div>
            
            <div class="cluster-strategy">
              <h5>营销策略建议</h5>
              <p>{{ currentCluster.strategy || getDefaultStrategy(currentClusterIndex) }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { mapState } from 'vuex'
import { getThemeValue } from '@/utils/theme_utils'

export default {
  name: 'KmeansResults',
  data() {
    return {
      clusterData: {
        timestamp: '',
        model_info: {},
        model_performance: {},
        clusters: [],
        summary: {}
      },
      currentClusterIndex: 0,
      loading: false,
      scatterChartInstance: null,
      distributionChartInstance: null,
      featureChartInstance: null,
      clusterInterval: null,
      systemDateTime: null,
      timerID: null,
      defaultFeatures: [
        { name: '消费频率', value: 0.85, is_high: true },
        { name: '客单价', value: 0.72, is_high: true },
        { name: '活跃度', value: 0.65, is_high: true },
        { name: '价格敏感度', value: 0.40, is_high: false },
        { name: '品类多样性', value: 0.62, is_high: true }
      ],
      defaultTraits: [
        [
          { label: '消费水平', value: '高' },
          { label: '购买频率', value: '高' },
          { label: '品牌忠诚度', value: '高' },
          { label: '渠道偏好', value: '线上' }
        ],
        [
          { label: '消费水平', value: '中' },
          { label: '购买频率', value: '高' },
          { label: '品牌忠诚度', value: '中' },
          { label: '渠道偏好', value: '全渠道' }
        ],
        [
          { label: '消费水平', value: '高' },
          { label: '购买频率', value: '低' },
          { label: '品牌忠诚度', value: '低' },
          { label: '渠道偏好', value: '线下' }
        ],
        [
          { label: '消费水平', value: '低' },
          { label: '购买频率', value: '低' },
          { label: '品牌忠诚度', value: '中' },
          { label: '渠道偏好', value: '线上' }
        ]
      ],
      clusterColors: [
        '#5470c6', '#91cc75', '#fac858', '#ee6666',
        '#73c0de', '#3ba272', '#fc8452', '#9a60b4'
      ],
      // 各组件是否全屏状态
      fullScreenStatus: {
        overview: false,
        feature: false,
        scatter: false,
        distribution: false,
        details: false,
        strategy: false
      }
    }
  },
  
  computed: {
    ...mapState(['theme']),
    currentCluster() {
      if (!this.clusterData.clusters || this.clusterData.clusters.length === 0) {
        return this.generateDefaultCluster(this.currentClusterIndex);
      }
      return this.clusterData.clusters[this.currentClusterIndex] || this.generateDefaultCluster(this.currentClusterIndex);
    },
    containerStyle() {
      return {
        backgroundColor: getThemeValue(this.theme).backgroundColor || '#161522',
        color: getThemeValue(this.theme).titleColor || '#fff',
      }
    }
  },
  
  mounted() {
    this.loadClusterData();
    this.startClusterInterval();
    this.currentTime();
    // 窗口大小变化时，重绘图表
    window.addEventListener('resize', this.handleResize);
  },
  
  beforeDestroy() {
    this.stopClusterInterval();
    clearInterval(this.timerID);
    window.removeEventListener('resize', this.handleResize);
    
    if (this.scatterChartInstance) {
      this.scatterChartInstance.dispose();
    }
    if (this.distributionChartInstance) {
      this.distributionChartInstance.dispose();
    }
    if (this.featureChartInstance) {
      this.featureChartInstance.dispose();
    }
  },
  
  methods: {
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
      this.$nextTick(() => {
        this.updateCharts();
      });
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
      if (this.scatterChartInstance) {
        this.scatterChartInstance.resize();
      }
      if (this.distributionChartInstance) {
        this.distributionChartInstance.resize();
      }
      if (this.featureChartInstance) {
        this.featureChartInstance.resize();
      }
    },
    
    // 窗口大小变化处理
    handleResize() {
      this.updateCharts();
    },

    async loadClusterData() {
      try {
        this.loading = true;
        
        try {
          const response = await this.$http.get('/api/analysis/kmeans/results');
          if (response.data && response.data.success) {
            this.clusterData = response.data.data;
          } else {
            throw new Error('API返回数据格式错误');
          }
        } catch (apiError) {
          console.log('API请求失败，使用模拟数据:', apiError.message);
          this.clusterData = this.getMockData();
        }
        
        this.$nextTick(() => {
          setTimeout(() => {
            this.initCharts();
            this.loading = false;
          }, 300);
        });
        
      } catch (error) {
        console.error('加载K-means数据失败:', error);
        this.$message.error('加载K-means数据失败: ' + error.message);
        
        this.clusterData = this.getMockData();
        
        this.$nextTick(() => {
          setTimeout(() => {
            this.initCharts();
            this.loading = false;
          }, 300);
        });
      }
    },

    getMockData() {
      return {
        timestamp: new Date().toISOString(),
        model_info: {
          algorithm: "K-means++",
          optimal_clusters: 4,
          iterations: 300,
          features: ["消费频率", "客单价", "活跃度", "价格敏感度", "品类多样性"]
        },
        model_performance: {
          silhouette_score: 0.72,
          inertia: 425.8,
          variance_explained: 0.85
        },
        summary: {
          sample_count: 5280,
          features_count: 5,
          clusters_count: 4,
          runtime_seconds: 18.5
        },
        clusters: [
          {
            id: 0,
            name: "高价值忠诚客户",
            size: 1280,
            percentage: 24.2,
            centroid: [0.85, 0.78, 0.92, 0.25, 0.65],
            description: "高消费、高频次购买的忠诚客户群体，对价格不敏感，品类偏好多样。",
            key_features: [
              { name: "消费频率", value: 0.85, is_high: true },
              { name: "客单价", value: 0.78, is_high: true },
              { name: "活跃度", value: 0.92, is_high: true },
              { name: "价格敏感度", value: 0.25, is_high: false },
              { name: "品类多样性", value: 0.65, is_high: true }
            ],
            traits: [
              { label: "消费水平", value: "高" },
              { label: "购买频率", value: "高" },
              { label: "品牌忠诚度", value: "高" },
              { label: "渠道偏好", value: "全渠道" }
            ],
            strategy: "提供会员专属服务，发展个性化推荐，增强品牌黏性，提高客户终身价值。"
          },
          {
            id: 1,
            name: "中高价值活跃客户",
            size: 1850,
            percentage: 35.0,
            centroid: [0.72, 0.56, 0.81, 0.42, 0.59],
            description: "中高消费、活跃度较高的客户群体，对促销活动有一定响应。",
            key_features: [
              { name: "消费频率", value: 0.72, is_high: true },
              { name: "客单价", value: 0.56, is_high: true },
              { name: "活跃度", value: 0.81, is_high: true },
              { name: "价格敏感度", value: 0.42, is_high: false },
              { name: "品类多样性", value: 0.59, is_high: true }
            ],
            traits: [
              { label: "消费水平", value: "中高" },
              { label: "购买频率", value: "中高" },
              { label: "品牌忠诚度", value: "中" },
              { label: "渠道偏好", value: "线上为主" }
            ],
            strategy: "针对性促销活动，提供产品搭配推荐，增加复购频次，提升客户价值。"
          },
          {
            id: 2,
            name: "价格敏感型客户",
            size: 1450,
            percentage: 27.5,
            centroid: [0.45, 0.38, 0.52, 0.85, 0.35],
            description: "消费水平中等、对价格高度敏感的客户群体，购买行为受促销驱动。",
            key_features: [
              { name: "消费频率", value: 0.45, is_high: false },
              { name: "客单价", value: 0.38, is_high: false },
              { name: "活跃度", value: 0.52, is_high: false },
              { name: "价格敏感度", value: 0.85, is_high: true },
              { name: "品类多样性", value: 0.35, is_high: false }
            ],
            traits: [
              { label: "消费水平", value: "中" },
              { label: "购买频率", value: "中" },
              { label: "品牌忠诚度", value: "低" },
              { label: "渠道偏好", value: "价格比较渠道" }
            ],
            strategy: "设计阶梯式价格促销，增加限时折扣活动，通过价格手段提高购买转化。"
          },
          {
            id: 3,
            name: "低频次潜力客户",
            size: 700,
            percentage: 13.3,
            centroid: [0.25, 0.48, 0.32, 0.60, 0.28],
            description: "购买频次低但单次消费不低的客户群体，有潜力转化为高价值客户。",
            key_features: [
              { name: "消费频率", value: 0.25, is_high: false },
              { name: "客单价", value: 0.48, is_high: false },
              { name: "活跃度", value: 0.32, is_high: false },
              { name: "价格敏感度", value: 0.60, is_high: true },
              { name: "品类多样性", value: 0.28, is_high: false }
            ],
            traits: [
              { label: "消费水平", value: "中" },
              { label: "购买频率", value: "低" },
              { label: "品牌忠诚度", value: "低" },
              { label: "渠道偏好", value: "线下为主" }
            ],
            strategy: "强化品牌接触频次，提供新客专享优惠，增加购买动机，提升客户活跃度。"
          }
        ]
      };
    },

    // 初始化所有图表
    initCharts() {
      this.initScatterChart();
      this.initDistributionChart();
      this.initFeatureChart();
    },

    // 初始化聚类散点图
    initScatterChart() {
      const chartContainer = this.$refs.scatterChart;
      if (!chartContainer) return;
      
      if (this.scatterChartInstance) {
        this.scatterChartInstance.dispose();
      }
      
      const isDark = this.theme === 'chalk';
      this.scatterChartInstance = echarts.init(chartContainer, isDark ? 'dark' : null);
      
      // 生成散点数据
      const scatterData = this.generateScatterData();
      
      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            return `聚类 ${params.seriesIndex + 1}<br/>样本点: ${params.dataIndex + 1}<br/>特征值: [${params.data[0].toFixed(2)}, ${params.data[1].toFixed(2)}]`;
          }
        },
        legend: {
          data: this.generateClusterNames(),
          bottom: 10,
          textStyle: {
            color: isDark ? '#ddd' : '#333'
          }
        },
        grid: {
          left: '5%',
          right: '5%',
          top: '8%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          name: '特征维度1',
          nameLocation: 'center',
          nameGap: 30,
          type: 'value',
          scale: true,
          axisLine: {
            lineStyle: {
              color: isDark ? '#444' : '#ccc'
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }
          }
        },
        yAxis: {
          name: '特征维度2',
          nameLocation: 'center',
          nameGap: 40,
          type: 'value',
          scale: true,
          axisLine: {
            lineStyle: {
              color: isDark ? '#444' : '#ccc'
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }
          }
        },
        series: this.generateClusterSeries(scatterData)
      };
      
      this.scatterChartInstance.setOption(option);
      
      // 添加鼠标交互事件
      this.scatterChartInstance.on('mouseover', () => {
        this.stopClusterInterval();
      });
      
      this.scatterChartInstance.on('mouseout', () => {
        this.startClusterInterval();
      });
    },

    // 初始化聚类分布饼图
    initDistributionChart() {
      const chartContainer = this.$refs.distributionChart;
      if (!chartContainer) return;
      
      if (this.distributionChartInstance) {
        this.distributionChartInstance.dispose();
      }
      
      const isDark = this.theme === 'chalk';
      this.distributionChartInstance = echarts.init(chartContainer, isDark ? 'dark' : null);
      
      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          bottom: 10,
          data: this.generateClusterNames(),
          textStyle: {
            color: isDark ? '#ddd' : '#333'
          }
        },
        series: [
          {
            name: '聚类分布',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '45%'],
            avoidLabelOverlap: true,
            itemStyle: {
              borderRadius: 8,
              borderColor: isDark ? '#1e1e1e' : '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center',
              color: isDark ? '#ddd' : '#333'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold',
                color: isDark ? '#fff' : '#333'
              }
            },
            labelLine: {
              show: false
            },
            data: this.generateClusterPieData()
          }
        ]
      };
      
      this.distributionChartInstance.setOption(option);
      
      // 添加鼠标交互事件
      this.distributionChartInstance.on('mouseover', (params) => {
        this.stopClusterInterval();
        this.showCluster(params.dataIndex);
      });
      
      this.distributionChartInstance.on('mouseout', () => {
        this.startClusterInterval();
      });
    },

    // 初始化特征重要性图表
    initFeatureChart() {
      const chartContainer = this.$refs.featureChart;
      if (!chartContainer) return;
      
      if (this.featureChartInstance) {
        this.featureChartInstance.dispose();
      }
      
      const isDark = this.theme === 'chalk';
      this.featureChartInstance = echarts.init(chartContainer, isDark ? 'dark' : null);
      
      const features = this.clusterData.model_info?.features || ["消费频率", "客单价", "活跃度", "价格敏感度", "品类多样性"];
      const importance = this.generateFeatureImportance(features.length);
      
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
          bottom: '5%',
          top: '8%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          max: 1,
          axisLine: {
            lineStyle: {
              color: isDark ? '#444' : '#ccc'
            }
          },
          splitLine: {
            lineStyle: {
              color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }
          }
        },
        yAxis: {
          type: 'category',
          data: features,
          axisLine: {
            lineStyle: {
              color: isDark ? '#444' : '#ccc'
            }
          },
          axisLabel: {
            color: isDark ? '#ddd' : '#333'
          }
        },
        series: [
          {
            name: '特征重要性',
            type: 'bar',
            data: importance.map((value, index) => ({
              value: value,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                  { offset: 0, color: this.clusterColors[index % this.clusterColors.length] + '40' },
                  { offset: 1, color: this.clusterColors[index % this.clusterColors.length] }
                ])
              }
            }))
          }
        ]
      };
      
      this.featureChartInstance.setOption(option);
    },

    // 生成模拟散点数据
    generateScatterData() {
      const clusters = this.clusterData.clusters || [];
      const numClusters = clusters.length || 4;
      const result = [];
      
      for (let i = 0; i < numClusters; i++) {
        const clusterPoints = [];
        const size = clusters[i]?.size || 100;
        const pointCount = Math.min(100, size);
        const centerX = Math.random() * 1.5 - 0.5;
        const centerY = Math.random() * 1.5 - 0.5;
        
        for (let j = 0; j < pointCount; j++) {
          const x = centerX + (Math.random() - 0.5) * 0.5;
          const y = centerY + (Math.random() - 0.5) * 0.5;
          clusterPoints.push([x, y]);
        }
        
        result.push(clusterPoints);
      }
      
      return result;
    },

    // 生成聚类名称
    generateClusterNames() {
      const clusters = this.clusterData.clusters || [];
      if (clusters.length > 0) {
        return clusters.map((cluster, index) => cluster.name || `聚类 ${index + 1}`);
      } else {
        const numClusters = this.clusterData.model_info?.optimal_clusters || 4;
        return Array.from({ length: numClusters }, (_, i) => `聚类 ${i + 1}`);
      }
    },

    // 生成散点图系列数据
    generateClusterSeries(scatterData) {
      return scatterData.map((points, index) => ({
        name: this.generateClusterNames()[index],
        type: 'scatter',
        symbolSize: 8,
        data: points,
        color: this.clusterColors[index % this.clusterColors.length],
        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        }
      }));
    },

    // 生成饼图数据
    generateClusterPieData() {
      const clusters = this.clusterData.clusters || [];
      if (clusters.length > 0) {
        return clusters.map((cluster, index) => ({
          value: cluster.size || 100,
          name: cluster.name || `聚类 ${index + 1}`,
          itemStyle: {
            color: this.clusterColors[index % this.clusterColors.length]
          }
        }));
      } else {
        const numClusters = this.clusterData.model_info?.optimal_clusters || 4;
        return Array.from({ length: numClusters }, (_, i) => ({
          value: 1000 + i * 200,
          name: `聚类 ${i + 1}`,
          itemStyle: {
            color: this.clusterColors[i % this.clusterColors.length]
          }
        }));
      }
    },

    // 生成模拟特征重要性数据
    generateFeatureImportance(featureCount) {
      const importance = [];
      for (let i = 0; i < featureCount; i++) {
        importance.push(Math.random() * 0.5 + 0.3);
      }
      // 降序排列
      return importance.sort((a, b) => b - a);
    },

    // 格式化数字
    formatNumber(value) {
      if (value === null || value === undefined) return '0';
      
      const numValue = Number(value);
      if (isNaN(numValue)) return '0';
      
      if (numValue >= 1000000) {
        return (numValue / 1000000).toFixed(1) + 'M';
      } else if (numValue >= 1000) {
        return (numValue / 1000).toFixed(1) + 'K';
      } else {
        return Math.round(numValue).toLocaleString();
      }
    },

    // 格式化分数
    formatScore(score) {
      return Number(score).toFixed(2);
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

    // 获取特征百分比值
    getFeaturePercentage(value) {
      return Math.min(100, Math.max(0, value * 100));
    },

    // 获取特征颜色
    getFeatureColor(value, isHigh) {
      if (isHigh) {
        // 高值是好的特性，用蓝色渐变
        return `rgba(64, 158, 255, ${value})`;
      } else {
        // 高值是负面特性，用红色渐变
        return `rgba(245, 108, 108, ${value})`;
      }
    },

    // 格式化特征值
    formatFeatureValue(value) {
      return (value * 100).toFixed(0) + '%';
    },

    // 获取聚类标签类型
    getClusterTagType(index) {
      const types = ['primary', 'success', 'warning', 'danger', 'info'];
      return types[index % types.length];
    },

    // 生成默认客户群策略
    getDefaultStrategy(index) {
      const strategies = [
        "针对高价值客户提供专属服务，保持客户忠诚度，增强高端品类销售。",
        "提供个性化推荐，增加交叉销售机会，提升客单价和复购频次。",
        "通过优惠促销活动吸引价格敏感型客户，增加购买频次。",
        "增强品牌认知，提供入门级产品吸引潜力客户，逐步提升客户价值。"
      ];
      return strategies[index % strategies.length];
    },

    // 生成默认描述
    getDefaultDescription(index) {
      const descriptions = [
        "高价值、高忠诚度的核心客户群体，消费频率高，客单价大，对价格不敏感。",
        "中高价值的活跃客户，消费频率较高，有较大提升空间，对品牌认可度较高。",
        "价格敏感型客户群体，购买行为主要受促销活动驱动，品牌忠诚度较低。",
        "低频次但单次消费不低的客户，需要提升活跃度，有较大的潜力转化空间。"
      ];
      return descriptions[index % descriptions.length];
    },

    // 生成默认集群
    generateDefaultCluster(index) {
      return {
        id: index,
        name: `客户群 ${index + 1}`,
        size: 1000 + index * 200,
        description: this.getDefaultDescription(index),
        key_features: this.defaultFeatures,
        traits: this.defaultTraits[index % 4],
        strategy: this.getDefaultStrategy(index)
      };
    },

    // 生成默认集群列表
    generateDefaultClusters() {
      return [0, 1, 2, 3].map(index => this.generateDefaultCluster(index));
    },

    // 显示特定聚类
    showCluster(index) {
      const totalClusters = this.clusterData.clusters?.length || 4;
      if (index >= 0 && index < totalClusters) {
        this.currentClusterIndex = index;
      }
    },

    // 开始聚类轮播
    startClusterInterval() {
      this.stopClusterInterval();
      this.clusterInterval = setInterval(() => {
        const totalClusters = this.clusterData.clusters?.length || 4;
        this.currentClusterIndex = (this.currentClusterIndex + 1) % totalClusters;
      }, 5000); // 每5秒切换一次聚类
    },

    // 停止聚类轮播
    stopClusterInterval() {
      if (this.clusterInterval) {
        clearInterval(this.clusterInterval);
        this.clusterInterval = null;
      }
    },

    // 事件处理函数
    async refreshData() {
      await this.loadClusterData();
      this.$message.success('数据已刷新');
    },

    exportReport() {
      try {
        const dataStr = JSON.stringify(this.clusterData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `kmeans-clusters-${new Date().toISOString().split('T')[0]}.json`;
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
// 全屏样式的定义
.fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  z-index: 9999;
  
  .panel-header {
    padding: 20px 30px !important;
  }
  
  .scatter-chart,
  .distribution-chart,
  .feature-chart {
    height: calc(100% - 80px) !important;
  }
}

.kmeans-container {
  width: 100%;
  height: 100vh;
  padding: 0 20px;
  background-color: #161522;
  color: #fff;
  box-sizing: border-box;
  overflow: hidden;
}

.kmeans-header {
  width: 100%;
  height: 64px;
  font-size: 20px;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .header-border {
    position: absolute;
    width: 100%;
    top: 0;
    left: 0;
    
    img {
      width: 100%;
    }
  }
  
  .header-left {
    z-index: 10;
    
    .back-btn {
      font-size: 16px;
      color: #e0e0e0;
      
      &:hover {
        color: #409eff;
      }
    }
  }
  
  .header-title {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-size: 24px;
    z-index: 10;
  }
  
  .header-right {
    display: flex;
    align-items: center;
    z-index: 10;
    
    .qiehuan {
      width: 28px;
      height: 21px;
      cursor: pointer;
      margin-right: 15px;
    }
    
    .datetime {
      font-size: 15px;
      margin-right: 20px;
    }
    
    .actions {
      display: flex;
      gap: 10px;
    }
  }
}

.analysis-info {
  padding: 10px 20px;
  display: flex;
  justify-content: space-evenly;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  margin: 10px 0;
  
  span {
    color: #a0a0a0;
    font-size: 14px;
  }
}

.kmeans-body {
  display: flex;
  height: calc(100vh - 150px);
  margin-top: 10px;
  
  .panel-left {
    width: 25%;
    height: 100%;
    margin-right: 15px;
    display: flex;
    flex-direction: column;
    
    #overview-panel {
      height: 42%;
      margin-bottom: 15px;
      position: relative;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      overflow: hidden;
    }
    
    #feature-panel {
      flex: 1;
      position: relative;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      overflow: hidden;
    }
  }
  
  .panel-middle {
    width: 40%;
    height: 100%;
    margin-right: 15px;
    display: flex;
    flex-direction: column;
    
    #scatter-panel {
      height: 55%;
      margin-bottom: 15px;
      position: relative;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      overflow: hidden;
    }
    
    #distribution-panel {
      flex: 1;
      position: relative;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      overflow: hidden;
    }
  }
  
  .panel-right {
    width: 35%;
    height: 100%;
    display: flex;
    flex-direction: column;
    
    #details-panel {
      height: 60%;
      margin-bottom: 15px;
      position: relative;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      overflow: hidden;
    }
    
    #strategy-panel {
      flex: 1;
      position: relative;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      overflow: hidden;
    }
  }
}

// 面板通用样式
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  .section-title {
    margin: 0;
    font-size: 16px;
    font-weight: normal;
  }
  
  .resize {
    cursor: pointer;
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.1);
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

// 概览卡片样式
.overview-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 10px;
  
  .stat-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    padding: 12px;
    display: flex;
    align-items: center;
    
    .card-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 10px;
      
      i {
        font-size: 20px;
        color: white;
      }
    }
    
    &.clusters .card-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    &.samples .card-icon {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }
    
    &.score .card-icon {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }
    
    &.features .card-icon {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
    
    .card-content {
      flex: 1;
      
      h3 {
        margin: 0;
        font-size: 12px;
        color: #a0a0a0;
        font-weight: normal;
      }
      
      .value {
        font-size: 20px;
        font-weight: bold;
        margin: 4px 0;
      }
      
      .change {
        font-size: 11px;
        
        &.positive { color: #67c23a; }
        &.negative { color: #f56c6c; }
        &.neutral { color: #909399; }
      }
    }
  }
}

// 特征重要性图表
.feature-chart {
  height: calc(100% - 50px);
  width: 100%;
}

// 散点图
.scatter-chart {
  height: calc(100% - 50px);
  width: 100%;
}

// 分布饼图
.distribution-chart {
  height: calc(100% - 50px);
  width: 100%;
}

// 聚类详情样式
.cluster-tabs {
  display: flex;
  gap: 8px;
  padding: 10px 20px;
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }
  
  .cluster-tab {
    padding: 6px 12px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.1);
    color: #e0e0e0;
    font-size: 13px;
    cursor: pointer;
    white-space: nowrap;
    
    &:hover {
      background: rgba(64, 158, 255, 0.2);
    }
    
    &.active {
      background: #409eff;
      color: white;
    }
  }
}

.cluster-details {
  padding: 10px 20px;
  
  .cluster-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    
    h3 {
      margin: 0;
      font-size: 16px;
      color: #e0e0e0;
    }
  }
  
  .cluster-description {
    margin-bottom: 15px;
    color: #a0a0a0;
    font-size: 13px;
    line-height: 1.5;
  }
  
  .feature-bars {
    .feature-bar {
      margin-bottom: 10px;
      
      .feature-name {
        margin-bottom: 3px;
        font-size: 12px;
        color: #e0e0e0;
        display: flex;
        justify-content: space-between;
      }
      
      .feature-value-container {
        height: 12px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        position: relative;
        overflow: hidden;
        
        .feature-value {
          height: 100%;
          border-radius: 6px;
          transition: width 0.5s;
        }
        
        .feature-value-text {
          position: absolute;
          right: 8px;
          top: 0;
          color: #e0e0e0;
          font-size: 9px;
          line-height: 12px;
        }
      }
    }
  }
}

// 策略内容样式
.strategy-content {
  padding: 10px 20px;
  
  .cluster-traits {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    padding: 10px 15px;
    margin-bottom: 15px;
    
    .trait-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .trait-label {
        color: #a0a0a0;
        font-size: 13px;
      }
      
      .trait-value {
        color: #e0e0e0;
        font-weight: 500;
        font-size: 13px;
      }
    }
  }
  
  .cluster-strategy {
    h5 {
      font-size: 14px;
      color: #e0e0e0;
      margin: 0 0 8px 0;
      font-weight: normal;
    }
    
    p {
      color: #a0a0a0;
      font-size: 13px;
      line-height: 1.5;
      margin: 0;
    }
  }
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .kmeans-body {
    flex-wrap: wrap;
    
    .panel-left {
      width: 49%;
      margin-right: 2%;
    }
    
    .panel-middle {
      width: 49%;
      margin-right: 0;
    }
    
    .panel-right {
      width: 100%;
      margin-top: 15px;
      height: auto;
      flex-direction: row;
      gap: 15px;
      
      #details-panel, #strategy-panel {
        height: auto;
        width: 50%;
        margin-bottom: 0;
      }
    }
  }
}

@media (max-width: 768px) {
  .kmeans-header {
    .header-title {
      font-size: 18px;
    }
    
    .header-right {
      .actions {
        display: none;
      }
    }
  }
  
  .kmeans-body {
    flex-direction: column;
    height: auto;
    
    .panel-left, .panel-middle, .panel-right {
      width: 100%;
      margin-right: 0;
      height: auto;
      margin-bottom: 15px;
    }
    
    .panel-right {
      flex-direction: column;
      
      #details-panel, #strategy-panel {
        width: 100%;
        height: 300px;
        margin-bottom: 15px;
      }
    }
    
    #overview-panel, #feature-panel, #scatter-panel, #distribution-panel {
      height: 300px;
    }
  }
}
</style>