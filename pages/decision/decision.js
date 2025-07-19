// pages/decision/decision.js
Page({
  data: {
    // 用户时间价值数据
    timeValue: 0,
    
    // 任务输入数据
    taskDescription: '', // 任务描述
    taskType: 'cleaning', // 任务类型
    taskTypeIndex: 0, // 任务类型索引
    estimatedHours: '', // 预估时间
    outsourcePrice: '', // 外包价格
    
    // 决策结果
    showResult: false,
    decision: '', // 决策结果
    analysis: {}, // 分析结果
    
    // 任务类型选项
    taskTypes: [
      { value: 'cleaning', name: '家务清洁', avgPrice: 30, description: '打扫卫生、整理房间' },
      { value: 'document', name: '文档整理', avgPrice: 25, description: '数据录入、文件整理' },
      { value: 'design', name: '设计制作', avgPrice: 50, description: '平面设计、PPT制作' },
      { value: 'tech', name: '技术开发', avgPrice: 100, description: '编程、网站开发' },
      { value: 'delivery', name: '跑腿代办', avgPrice: 20, description: '快递取送、购物代买' },
      { value: 'other', name: '其他任务', avgPrice: 40, description: '自定义任务类型' }
    ],
    
    // 历史记录
    decisionHistory: []
  },

  onLoad: function() {
    console.log('=== 决策页面加载开始 ===');
    
    // 详细的数据检查
    const rawData = wx.getStorageSync('timeCalculatorData');
    console.log('原始localStorage数据:', rawData);
    console.log('数据类型:', typeof rawData);
    
    // 加载用户时间价值数据
    this.loadTimeValue();
    // 加载历史记录
    this.loadDecisionHistory();
    
    // 页面数据状态检查
    setTimeout(() => {
      console.log('页面加载后的timeValue:', this.data.timeValue);
      console.log('timeValue类型:', typeof this.data.timeValue);
      console.log('timeValue > 0?', this.data.timeValue > 0);
      console.log('完整页面数据:', this.data);
    }, 100);
    
    console.log('=== 决策页面加载完成 ===');
  },

  onShow: function() {
    // 每次显示页面时重新加载时间价值数据
    this.loadTimeValue();
  },

  // 加载时间价值数据
  loadTimeValue: function() {
    try {
      const timeData = wx.getStorageSync('timeCalculatorData');
      console.log('=== 决策页面时间价值加载调试 ===');
      console.log('原始数据:', timeData);
      console.log('数据类型:', typeof timeData);
      
      let timeValue = 0;
      if (timeData) {
        console.log('检测到数据，timeData.timeValue:', timeData.timeValue);
        console.log('timeData.timeValue的类型:', typeof timeData.timeValue);
        
        if (timeData.timeValue !== undefined && timeData.timeValue !== null) {
          // 处理可能的字符串类型
          if (typeof timeData.timeValue === 'string') {
            console.log('发现字符串类型的timeValue，尝试转换...');
            timeValue = parseFloat(timeData.timeValue);
          } else {
            timeValue = timeData.timeValue;
          }
          
          console.log('解析后时间价值:', timeValue);
          console.log('是否为有效数字:', !isNaN(timeValue) && timeValue > 0);
        } else {
          console.log('timeData.timeValue为null或undefined');
        }
      } else {
        console.log('未找到时间价值数据');
      }
      
      this.setData({
        timeValue: timeValue
      });
      
      console.log('决策页面设置的时间价值:', this.data.timeValue);
      console.log('=== 调试结束 ===');
    } catch (error) {
      console.error('加载时间价值数据失败:', error);
      this.setData({
        timeValue: 0
      });
    }
  },

  // 加载历史记录
  loadDecisionHistory: function() {
    try {
      const history = wx.getStorageSync('decisionHistory') || [];
      this.setData({
        decisionHistory: history
      });
    } catch (error) {
      console.error('加载历史记录失败:', error);
    }
  },

  // 保存决策记录
  saveDecisionRecord: function(record) {
    try {
      const history = this.data.decisionHistory || [];
      const newRecord = {
        ...record,
        id: Date.now(),
        timestamp: new Date().toISOString()
      };
      history.unshift(newRecord);
      
      // 只保留最近100条记录
      if (history.length > 100) {
        history.splice(100);
      }
      
      wx.setStorageSync('decisionHistory', history);
      this.setData({
        decisionHistory: history
      });
    } catch (error) {
      console.error('保存决策记录失败:', error);
    }
  },

  // 任务描述输入
  onTaskDescriptionInput: function(e) {
    this.setData({
      taskDescription: e.detail.value
    });
  },

  // 任务类型选择
  onTaskTypeChange: function(e) {
    const selectedType = this.data.taskTypes[e.detail.value];
    this.setData({
      taskType: selectedType.value,
      taskTypeIndex: e.detail.value,
      // 自动填充建议价格
      outsourcePrice: selectedType.avgPrice.toString()
    });
  },

  // 预估时间输入
  onEstimatedHoursInput: function(e) {
    this.setData({
      estimatedHours: e.detail.value
    });
  },

  // 外包价格输入
  onOutsourcePriceInput: function(e) {
    this.setData({
      outsourcePrice: e.detail.value
    });
  },

  // 开始决策分析
  analyzeDecision: function() {
    const { taskDescription, taskType, estimatedHours, outsourcePrice, timeValue } = this.data;
    
    // 验证输入
    if (!taskDescription.trim()) {
      wx.showToast({
        title: '请输入任务描述',
        icon: 'none'
      });
      return;
    }
    
    if (!estimatedHours || !outsourcePrice) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }
    
    if (timeValue <= 0) {
      wx.showToast({
        title: '请先设置时间价值',
        icon: 'none'
      });
      return;
    }
    
    // 进行决策分析
    const hours = parseFloat(estimatedHours);
    const price = parseFloat(outsourcePrice);
    const pricePerHour = price / hours;
    const timeCost = timeValue * hours;
    const savings = timeCost - price;
    const roi = savings > 0 ? (savings / price * 100) : 0;
    
    // 决策逻辑
    let decision = '';
    let recommendation = '';
    let reason = '';
    
    if (pricePerHour < timeValue) {
      decision = 'hire';
      recommendation = '建议雇人';
      reason = `外包单价 ¥${pricePerHour.toFixed(2)}/小时 < 你的时间价值 ¥${timeValue.toFixed(2)}/小时`;
    } else {
      decision = 'self';
      recommendation = '建议自己做';
              reason = `外包单价 ¥${pricePerHour.toFixed(2)}/小时 > 你的时间价值 ¥${timeValue.toFixed(2)}/小时`;
    }
    
    const analysis = {
      hours,
      price,
      pricePerHour,
      timeCost,
      savings,
      roi,
      decision,
      recommendation,
      reason
    };
    
    this.setData({
      showResult: true,
      decision,
      analysis
    });
    
    // 保存决策记录
    this.saveDecisionRecord({
      taskDescription,
      taskType,
      estimatedHours: hours,
      outsourcePrice: price,
      userTimeValue: timeValue,
      analysis
    });
  },

  // 重新分析
  resetAnalysis: function() {
    this.setData({
      showResult: false,
      decision: '',
      analysis: {}
    });
  },

  // 清空表单
  clearForm: function() {
    this.setData({
      taskDescription: '',
      taskType: 'cleaning',
      estimatedHours: '',
      outsourcePrice: '',
      showResult: false,
      decision: '',
      analysis: {}
    });
  },

  // 跳转到设置时间价值
  goToCalculator: function() {
    wx.switchTab({
      url: '/pages/calculator/calculator'
    });
  },

  // 查看历史记录
  viewHistory: function() {
    wx.navigateTo({
      url: '/pages/decision/history'
    });
  },

  // 查看任务类型说明
  showTaskTypeInfo: function() {
    const typeInfo = this.data.taskTypes.map(type => `${type.name}：${type.description} (参考价格：¥${type.avgPrice}/小时)`).join('\n\n');
    wx.showModal({
      title: '任务类型说明',
      content: typeInfo,
      showCancel: false
    });
  },

  // 调试：手动重新加载时间价值
  debugLoadTimeValue: function() {
    console.log('=== 手动重新加载时间价值 ===');
    
    // 直接检查localStorage
    const rawData = wx.getStorageSync('timeCalculatorData');
    console.log('localStorage中的原始数据:', rawData);
    
    // 重新加载
    this.loadTimeValue();
    
    // 显示当前页面数据
    console.log('重新加载后的页面数据:', this.data);
    
    wx.showToast({
      title: '已重新加载，查看调试信息',
      icon: 'none'
    });
  }
});