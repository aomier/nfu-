<!-- filepath: c:\Users\Mcola.Tech\数据分析\data-view\src\components\AnalysisControl.vue -->
<template>
  <div class="analysis-control">
    <div class="control-header">
      <h3>数据分析控制面板</h3>
      <p>利润与价格敏感度分析</p>
    </div>
    
    <div class="control-body">
      <!-- 数据源选择 -->
      <div class="form-group">
        <label>数据文件路径：</label>
        <el-input
          v-model="dataPath"
          placeholder="请输入数据文件路径"
          class="path-input"
        >
          <el-button 
            slot="append" 
            icon="el-icon-folder-opened" 
            @click="selectFile"
          >
            选择文件
          </el-button>
        </el-input>
      </div>

      <!-- 分析参数 -->
      <div class="form-group">
        <label>分析类型：</label>
        <el-checkbox-group v-model="analysisTypes">
          <el-checkbox label="profit">利润分析</el-checkbox>
          <el-checkbox label="price_sensitivity">价格敏感度</el-checkbox>
          <el-checkbox label="category_analysis">品类分析</el-checkbox>
        </el-checkbox-group>
      </div>

      <!-- 高级选项 -->
      <div class="form-group">
        <el-collapse v-model="activeCollapse">
          <el-collapse-item title="高级选项" name="advanced">
            <div class="advanced-options">
              <div class="option-item">
                <label>最小利润率阈值：</label>
                <el-input-number
                  v-model="minProfitRate"
                  :min="0"
                  :max="1"
                  :step="0.01"
                  :precision="2"
                  size="small"
                />
              </div>
              
              <div class="option-item">
                <label>价格敏感度系数：</label>
                <el-input-number
                  v-model="priceSensitivity"
                  :min="0.1"
                  :max="5"
                  :step="0.1"
                  :precision="1"
                  size="small"
                />
              </div>
              
              <div class="option-item">
                <label>输出格式：</label>
                <el-select v-model="outputFormat" size="small">
                  <el-option label="JSON" value="json"></el-option>
                  <el-option label="CSV" value="csv"></el-option>
                  <el-option label="Excel" value="excel"></el-option>
                </el-select>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- 控制按钮 -->
      <div class="control-buttons">
        <el-button 
          type="primary" 
          @click="startAnalysis"
          :loading="isAnalyzing"
          icon="el-icon-data-analysis"
          size="medium"
        >
          {{ isAnalyzing ? '分析中...' : '开始分析' }}
        </el-button>
        
        <el-button 
          @click="resetForm"
          size="medium"
        >
          重置
        </el-button>
        
        <el-button 
          type="info"
          @click="loadSampleData"
          size="medium"
        >
          使用示例数据
        </el-button>
      </div>

      <!-- 进度显示 -->
      <div v-if="isAnalyzing" class="progress-section">
        <el-progress 
          :percentage="analysisProgress" 
          :stroke-width="8"
          :text-inside="true"
        ></el-progress>
        <p class="progress-text">{{ progressText }}</p>
      </div>

      <!-- 最近分析历史 -->
      <div class="history-section">
        <h4>最近分析记录</h4>
        <div class="history-list">
          <div 
            v-for="(item, index) in analysisHistory" 
            :key="index"
            class="history-item"
            @click="loadHistoryResult(item)"
          >
            <div class="history-info">
              <span class="history-time">{{ formatTime(item.timestamp) }}</span>
              <span class="history-path">{{ item.dataPath.split('/').pop() }}</span>
            </div>
            <el-button size="mini" type="text">加载</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnalysisControl',
  data() {
    return {
      dataPath: 'd:/2023/',
      analysisTypes: ['profit', 'price_sensitivity'],
      activeCollapse: [],
      minProfitRate: 0.05,
      priceSensitivity: 1.0,
      outputFormat: 'json',
      isAnalyzing: false,
      analysisProgress: 0,
      progressText: '准备分析...',
      analysisHistory: []
    }
  },
  mounted() {
    this.loadAnalysisHistory()
  },
  methods: {
    async startAnalysis() {
      if (!this.dataPath.trim()) {
        this.$message.error('请输入数据文件路径')
        return
      }

      this.isAnalyzing = true
      this.analysisProgress = 0
      this.progressText = '正在启动分析服务...'

      try {
        // 模拟分析进度
        this.simulateProgress()

        const analysisParams = {
          dataPath: this.dataPath,
          analysisTypes: this.analysisTypes,
          minProfitRate: this.minProfitRate,
          priceSensitivity: this.priceSensitivity,
          outputFormat: this.outputFormat
        }

        const response = await this.$http.post('/analysis/profit', analysisParams)

        if (response.data.success) {
          this.analysisProgress = 100
          this.progressText = '分析完成！'
          
          // 保存到历史记录
          this.saveToHistory(analysisParams, response.data.data)
          
          // 发射分析完成事件
          this.$emit('analysis-complete', response.data.data)
          
          this.$message.success('数据分析完成！')
        } else {
          throw new Error(response.data.message || '分析失败')
        }

      } catch (error) {
        console.error('分析错误:', error)
        this.$message.error('分析失败: ' + error.message)
        this.progressText = '分析失败: ' + error.message
      } finally {
        this.isAnalyzing = false
        setTimeout(() => {
          this.analysisProgress = 0
          this.progressText = '准备分析...'
        }, 3000)
      }
    },

    simulateProgress() {
      const steps = [
        { progress: 10, text: '正在读取数据文件...' },
        { progress: 25, text: '正在处理商品数据...' },
        { progress: 40, text: '正在计算利润率...' },
        { progress: 60, text: '正在分析价格敏感度...' },
        { progress: 80, text: '正在生成图表配置...' },
        { progress: 95, text: '正在保存结果...' }
      ]

      let stepIndex = 0
      const progressInterval = setInterval(() => {
        if (stepIndex < steps.length && this.isAnalyzing) {
          this.analysisProgress = steps[stepIndex].progress
          this.progressText = steps[stepIndex].text
          stepIndex++
        } else {
          clearInterval(progressInterval)
        }
      }, 1000)
    },

    selectFile() {
      // 创建文件选择器
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.csv,.xlsx,.xls'
      input.onchange = (e) => {
        const file = e.target.files[0]
        if (file) {
          this.dataPath = file.path || file.name
        }
      }
      input.click()
    },

    resetForm() {
      this.dataPath = 'd:/2023/'
      this.analysisTypes = ['profit', 'price_sensitivity']
      this.minProfitRate = 0.05
      this.priceSensitivity = 1.0
      this.outputFormat = 'json'
      this.activeCollapse = []
    },

    loadSampleData() {
      this.dataPath = 'd:/2023/sample_data.csv'
      this.$message.info('已加载示例数据路径')
    },

    saveToHistory(params, result) {
      const historyItem = {
        timestamp: Date.now(),
        dataPath: params.dataPath,
        analysisTypes: params.analysisTypes,
        result: result
      }
      
      this.analysisHistory.unshift(historyItem)
      
      // 只保留最近10条记录
      if (this.analysisHistory.length > 10) {
        this.analysisHistory = this.analysisHistory.slice(0, 10)
      }
      
      // 保存到本地存储
      localStorage.setItem('analysisHistory', JSON.stringify(this.analysisHistory))
    },

    loadAnalysisHistory() {
      const history = localStorage.getItem('analysisHistory')
      if (history) {
        this.analysisHistory = JSON.parse(history)
      }
    },

    loadHistoryResult(historyItem) {
      this.$emit('analysis-complete', historyItem.result)
      this.$message.success('已加载历史分析结果')
    },

    formatTime(timestamp) {
      return new Date(timestamp).toLocaleString()
    }
  }
}
</script>

<style lang="less" scoped>
.analysis-control {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  color: #333;

  .control-header {
    text-align: center;
    margin-bottom: 25px;
    
    h3 {
      margin: 0 0 5px 0;
      color: #409eff;
      font-size: 18px;
    }
    
    p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
  }

  .control-body {
    .form-group {
      margin-bottom: 20px;
      
      label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #333;
      }
      
      .path-input {
        width: 100%;
      }
    }

    .advanced-options {
      .option-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        
        label {
          margin: 0;
          margin-right: 10px;
          white-space: nowrap;
        }
      }
    }

    .control-buttons {
      display: flex;
      gap: 10px;
      margin: 25px 0;
      
      .el-button {
        flex: 1;
      }
    }

    .progress-section {
      margin: 20px 0;
      
      .progress-text {
        text-align: center;
        margin-top: 10px;
        color: #666;
        font-size: 14px;
      }
    }

    .history-section {
      margin-top: 30px;
      border-top: 1px solid #eee;
      padding-top: 20px;
      
      h4 {
        margin: 0 0 15px 0;
        color: #333;
        font-size: 16px;
      }
      
      .history-list {
        max-height: 200px;
        overflow-y: auto;
        
        .history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          border: 1px solid #eee;
          border-radius: 4px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.3s;
          
          &:hover {
            background: #f5f7fa;
            border-color: #409eff;
          }
          
          .history-info {
            display: flex;
            flex-direction: column;
            flex: 1;
            
            .history-time {
              font-size: 12px;
              color: #999;
            }
            
            .history-path {
              font-size: 14px;
              color: #333;
              margin-top: 2px;
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .analysis-control {
    padding: 15px;
    
    .control-buttons {
      flex-direction: column;
      
      .el-button {
        margin-bottom: 10px;
      }
    }
    
    .advanced-options {
      .option-item {
        flex-direction: column;
        align-items: flex-start;
        
        label {
          margin-bottom: 5px;
        }
      }
    }
  }
}
</style>