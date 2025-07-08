<template>
  <div class="screen-container">
    <canvas ref="backgroundCanvas" class="background-canvas"></canvas>
    
    <div class="content-wrapper">
      <header class="screen-header">
        <div class="header-left">
          <span class="logo-text">虾皮数据分析平台</span>
          <span class="logo-subtext">虾皮不皮团队制作</span>
        </div>
        <div class="header-right">
          <div class="datetime">{{ currentTime }}</div>
          <div class="system-status">
            <div class="status-dot"></div>
            <span>系统运行正常</span>
          </div>
        </div>
      </header>
      <main class="screen-body">
        <div class="bento-grid">
          <div class="bento-cell welcome-cell">
            <h1 class="welcome-title">数据驱动决策</h1>
            <p class="welcome-description">
              通过先进的机器学习算法和数据可视化技术，为您的业务提供深度洞察和智能分析。
            </p>
            <div class="research-stats">
              <div class="stat-item">
                <div class="stat-number">4</div>
                <div class="stat-label">分析模型</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">97.5%</div>
                <div class="stat-label">准确率</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">24/7</div>
                <div class="stat-label">实时监控</div>
              </div>
            </div>
          </div>

          <div class="bento-cell module-card" @click="navigateToModule('profit')">
            <div class="card-glow"></div>
            <div class="card-content">
              <div class="card-header">
                <div class="module-icon profit-icon">
                  💰
                </div>
                <span class="module-badge">财务分析</span>
              </div>
              <h3 class="module-title">盈利能力分析</h3>
              <p class="module-desc">
                深入分析企业盈利结构，识别高价值客户群体，优化资源配置策略。
              </p>
              <div class="card-footer">
                <div class="method-tags">
                  <span>ROI分析</span>
                  <span>客户细分</span>
                </div>
                <div class="enter-btn">
                  <span>进入分析</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bento-cell module-card" @click="navigateToModule('kmeans')">
            <div class="card-glow"></div>
            <div class="card-content">
              <div class="card-header">
                <div class="module-icon kmeans-icon">
                  📊
                </div>
                <span class="module-badge">机器学习</span>
              </div>
              <h3 class="module-title">K-means 聚类分析</h3>
              <p class="module-desc">
                基于无监督学习的聚类算法，自动识别数据中的隐藏模式和客户群体。
              </p>
              <div class="card-footer">
                <div class="method-tags">
                  <span>聚类算法</span>
                  <span>模式识别</span>
                </div>
                <div class="enter-btn">
                  <span>进入分析</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bento-cell module-card" @click="navigateToModule('prophet')">
            <div class="card-glow"></div>
            <div class="card-content">
              <div class="card-header">
                <div class="module-icon prophet-icon">
                  📈
                </div>
                <span class="module-badge">时间序列</span>
              </div>
              <h3 class="module-title">Prophet 时间序列预测</h3>
              <p class="module-desc">
                利用Facebook开源的Prophet模型，准确预测业务指标的未来趋势。
              </p>
              <div class="card-footer">
                <div class="method-tags">
                  <span>趋势预测</span>
                  <span>季节性分析</span>
                </div>
                <div class="enter-btn">
                  <span>进入分析</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bento-cell module-card" @click="navigateToModule('heatmap')">
            <div class="card-glow"></div>
            <div class="card-content">
              <div class="card-header">
                <div class="module-icon heatmap-icon">
                  🔥
                </div>
                <span class="module-badge">可视化</span>
              </div>
              <h3 class="module-title">热力图可视化</h3>
              <p class="module-desc">
                直观展示数据分布和相关性，快速识别业务热点和异常区域。
              </p>
              <div class="card-footer">
                <div class="method-tags">
                  <span>数据可视化</span>
                  <span>相关性分析</span>
                </div>
                <div class="enter-btn">
                  <span>进入分析</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
// 导入核心库
const THREE = require('three');
const { gsap } = require('gsap');
const { ScrollTrigger } = require('gsap/ScrollTrigger');
const VanillaTilt = require('vanilla-tilt');

// 导入图标库及所需图标
const { OhVueIcon, addIcons } = require('oh-vue-icons');
const {
  CoMoney,
  OiGitCompare,
  BiGraphUp,
  HiChartBar,
  HiArrowRight
} = require('oh-vue-icons/icons');

// 注册 GSAP 插件
gsap.registerPlugin(ScrollTrigger);

// 添加所需图标
addIcons(CoMoney, OiGitCompare, BiGraphUp, HiChartBar, HiArrowRight);

export default {
  name: 'Home',
  components: {
    'v-icon': OhVueIcon
  },
  data() {
    return {
      currentTime: '',
      three_scene: null,
      three_camera: null,
      three_renderer: null,
      three_particles: null
    };
  },
  mounted() {
    this.updateTime();
    this.timeInterval = setInterval(this.updateTime, 1000);
    
    this.initThreeBg();
    this.initScrollAnimations();
    this.initTiltEffect();
    
    window.addEventListener('resize', this.onWindowResize);
  },
  beforeDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    window.removeEventListener('resize', this.onWindowResize);
  },
  methods: {
    updateTime() {
      const now = new Date();
      this.currentTime = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    },

    navigateToModule(module) {
      console.log('导航到模块:', module); // 添加调试日志
      this.$router.push(`/${module}`);
    },

    initThreeBg() {
      // Three.js 背景初始化
      console.log('初始化Three.js背景');
    },

    initScrollAnimations() {
      // 滚动动画初始化
      console.log('初始化滚动动画');
    },

    initTiltEffect() {
      // 卡片倾斜效果初始化
      console.log('初始化倾斜效果');
    },

    onWindowResize() {
      // 窗口大小变化处理
      console.log('窗口大小变化');
    },
  },
};
</script>

<style lang="less" scoped>
// --- 基础和布局 ---
.screen-container {
  width: 100%;
  min-height: 100vh;
  background-color: #0c0a18;
  color: #e0e0e0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  position: relative;
  overflow-x: hidden;
}

.background-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  opacity: 0.3;
}

.content-wrapper {
  position: relative;
  z-index: 2;
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  /* FIX: Explicitly set width and box-sizing to ensure the container respects its parent's boundaries. */
  width: 100%;
  box-sizing: border-box;
}

// --- 头部 ---
.screen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .logo-text {
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: 1px;
  }

  .logo-subtext {
    font-size: 0.8rem;
    color: #888;
    font-weight: 300;
  }

  .header-right {
    text-align: right;
  }

  .datetime {
    font-size: 1rem;
    font-weight: 400;
  }

  .system-status {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
    font-size: 0.8rem;
    color: #888;
    margin-top: 0.25rem;

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #4ade80;
      animation: pulse 2s infinite;
    }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 5px #4ade80; }
  50% { opacity: 0.6; box-shadow: none; }
}

// --- Bento 网格布局 ---
.screen-body {
  width: 100%;
  min-height: 400px;
  max-height: calc(100vh - 120px); // 120px可根据header+padding实际高度调整
  overflow-y: auto;                // 关键！出现纵向滚动条
  border: 1px solid rgba(255, 255, 255, 0.1);
  // 可选：美化滚动条
  &::-webkit-scrollbar {
    width: 8px;
    background: rgba(255,255,255,0.05);
  }
  &::-webkit-scrollbar-thumb {
    background: #615eff;
    border-radius: 4px;
  }
}

.bento-grid {
  display: grid;
  /* FIX: Changed to a 2-column layout to match the local version. */
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: auto;
  gap: 1.5rem;
  // 添加调试样式
  border: 1px solid rgba(255, 255, 0, 0.3);
  padding: 1rem;
}

// --- 单元格样式 ---
.bento-cell {
  position: relative;
  border-radius: 20px;
  background: rgba(23, 27, 46, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  // 移除初始透明度，确保内容可见
  opacity: 1;
  // 添加最小高度
  min-height: 200px;
}

// 欢迎单元格特定样式
.welcome-cell {
  /* FIX: Adjusted welcome cell to span 1 column and 2 rows for the desired layout. */
  grid-column: span 1;
  grid-row: span 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: left;

  .welcome-title {
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 1rem;
    background: linear-gradient(90deg, #a777e3, #615eff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .welcome-description {
    font-size: 1.1rem;
    color: #a0a0a0;
    margin-bottom: 2rem;
    max-width: 80%;
  }

  .research-stats {
    display: flex;
    gap: 3rem;
    
    .stat-item {
      .stat-number {
        font-size: 2rem;
        font-weight: 700;
        color: #615eff;
      }
      .stat-label {
        font-size: 0.9rem;
        color: #888;
        margin-top: 0.5rem;
      }
    }
  }
}

// --- 模块卡片样式 ---
.module-card {
  /* FIX: Adjusted module card to span 1 column. */
  grid-column: span 1;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(97, 94, 255, 0.3);
    
    .card-glow {
      opacity: 1;
    }
    
    .enter-btn {
      background: #615eff;
      color: #fff;
    }
  }

  .card-glow {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 20px;
    opacity: 0;
    transition: opacity 0.4s ease;
    z-index: -1;
    background: radial-gradient(circle at 50% 50%, rgba(97, 94, 255, 0.2), transparent 70%);
  }

  .card-content {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .module-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: #fff;

    &.profit-icon { background: linear-gradient(135deg, #a777e3, #615eff); }
    &.kmeans-icon { background: linear-gradient(135deg, #5ee7df, #b490ca); }
    &.prophet-icon { background: linear-gradient(135deg, #ffc371, #ff5f6d); }
    &.heatmap-icon { background: linear-gradient(135deg, #c2e59c, #64b3f4); }
  }

  .module-badge {
    background: rgba(255, 255, 255, 0.1);
    padding: 0.3rem 0.7rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
  }
  
  .module-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
    color: #fff;
  }
  
  .module-desc {
    flex-grow: 1;
    font-size: 0.95rem;
    color: #a0a0a0;
    line-height: 1.6;
    margin-top: 0.5rem;
  }
  
  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1.5rem;
  }

  .method-tags {
    display: flex;
    gap: 0.5rem;
    
    span {
      background: rgba(255, 255, 255, 0.05);
      padding: 0.3rem 0.6rem;
      border-radius: 8px;
      font-size: 0.75rem;
      color: #ccc;
    }
  }

  .enter-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.1);
    font-weight: 500;
    transition: all 0.3s ease;
  }
}

// --- 响应式设计 ---
@media (max-width: 1200px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .welcome-cell {
    grid-column: span 2;
    grid-row: span 1;
  }
  .module-card {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .content-wrapper { 
    padding: 1rem; 
  }
  
  .screen-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .bento-grid {
    grid-template-columns: 1fr;
  }
  
  .welcome-cell, .module-card {
    grid-column: span 1;
  }
  
  .welcome-cell {
    .welcome-title { 
      font-size: 2rem; 
    }
    .welcome-description { 
      max-width: 100%; 
    }
  }
}
</style>
