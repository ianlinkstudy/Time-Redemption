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
    // 加载用户时间价值数据
    this.loadTimeValue();
    // 加载历史记录
    this.loadDecisionHistory();
  },

  onShow: function() {
    // 每次显示页面时重新加载时间价值数据
    this.loadTimeValue();
  },

  // 加载时间价值数据
  loadTimeValue: function() {
    try {
      const timeData = wx.getStorageSync('timeCalculatorData');
      if (timeData) {
        this.setData({
          timeValue: timeData.timeValue || 0
        });
      }
    } catch (error) {
      console.error('加载时间价值数据失败:', error);
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
  }
});