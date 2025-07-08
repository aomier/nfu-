import axios from 'axios';

export const getAIAnalysisStream = async (prompt, onData = () => {}) => {
  try {
    console.log('🚀 发送流式AI分析请求...');
    console.log('📝 提示词长度:', prompt.length);
    
    // 使用fetch而不是axios来处理流式响应
    const response = await fetch('http://localhost:8999/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });
    
    if (!response.ok) {
      throw new Error(`AI服务错误(${response.status}): ${response.statusText}`);
    }
    
    console.log('✅ 开始接收流式响应...');
    
    // 处理流式响应
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      const text = decoder.decode(value, { stream: true });
      fullContent += text;
      
      // 调用回调函数，传递新增的文本
      onData(text, fullContent);
    }
    
    console.log('🎯 流式响应完成，总长度:', fullContent.length);
    return fullContent;
    
  } catch (error) {
    console.error('❌ AI分析请求错误:', error);
    throw new Error(error.message || 'AI分析服务配置错误');
  }
};

// 保留原有的非流式版本作为备用
export const getAIAnalysis = async (prompt) => {
  try {
    console.log('🚀 发送AI分析请求...');
    console.log('📝 提示词长度:', prompt.length);
    
    const response = await axios.post('http://localhost:8999/api/proxy', {
      prompt
    }, {
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ 收到AI响应, 状态:', response.status);
    console.log('📄 响应数据:', response.data);
    
    // 确保返回字符串类型的数据
    const result = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    console.log('🎯 处理后的结果长度:', result.length);
    
    return result || '未能获取到有效的AI分析结果';
  } catch (error) {
    console.error('❌ AI分析请求错误:', error);
    console.error('错误详情:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    if (error.response) {
      throw new Error(`AI服务错误(${error.response.status}): ${error.response.data || error.response.statusText}`);
    } else if (error.request) {
      throw new Error('无法连接到AI服务器，请检查网络连接和服务器状态');
    } else {
      throw new Error(error.message || 'AI分析服务配置错误');
    }
  }
};

// 移除孤立的 }; 并正确定义函数
async function generateAiAnalysis(chartName, params, dataContext = {}) {
  try {
    // 设置加载状态 - 这部分应该在Vue组件中处理
    console.log('🎯 开始生成AI分析...');
    
    // 构建提示词 - 使用动态数据而不是硬编码
    let prompt = `作为数据分析专家，请基于以下数据进行分析：\n\n`;
    
    // 使用传入的数据上下文
    const {
      totalProfit = 0,
      totalSales = 0,
      avgProfitRate = 0,
      productCount = 0,
      profitGrowth = 0,
      salesGrowth = 0,
      profitRateChange = 0
    } = dataContext;
    
    prompt += `- 总利润：¥${totalProfit.toLocaleString()} (${profitGrowth >= 0 ? '+' : ''}${profitGrowth}%)\n`;
    prompt += `- 总销售额：¥${totalSales.toLocaleString()} (${salesGrowth >= 0 ? '+' : ''}${salesGrowth}%)\n`;
    prompt += `- 平均利润率：${avgProfitRate}% (${profitRateChange >= 0 ? '+' : ''}${profitRateChange}%)\n`;
    prompt += `- 商品数量：${productCount.toLocaleString()}\n\n`;
    
    if (chartName && params) {
      prompt += `用户点击了【${chartName}】图表中的数据点。\n`;
      // 可以添加更多上下文信息
      if (params.category) {
        prompt += `关注类别：${params.category}\n`;
      }
      if (params.value) {
        prompt += `数据值：${params.value}\n`;
      }
    }
    
    prompt += `请分析这些数据，识别关键趋势，并提供3点具体可行的优化建议。`;
    
    console.log('📝 发送提示词:', prompt.substring(0, 100) + '...');
    
    // 健康检查
    await checkApiHealth();
    
    // 调用AI分析
    const result = await getAIAnalysis(prompt);
    console.log('✅ AI分析完成，结果长度:', result?.length || 0);
    
    return result;
  } catch (error) {
    console.error('💥 AI分析失败:', error);
    throw new Error(error.message || '生成分析失败，请稍后重试');
  }
}

// 提取健康检查为独立函数
async function checkApiHealth() {
  try {
    const testResponse = await fetch('/api/health');
    if (testResponse.ok) {
      console.log('✅ 代理连接测试成功');
    } else {
      console.warn('⚠️ 代理连接测试失败:', testResponse.status);
    }
  } catch (proxyError) {
    console.error('❌ 代理连接测试错误:', proxyError);
    // 不抛出错误，允许继续执行
  }
}

// 导出函数
export { generateAiAnalysis, checkApiHealth };
