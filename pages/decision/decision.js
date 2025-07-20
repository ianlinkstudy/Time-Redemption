// pages/decision/decision.js
Page({
  data: {
    // 用户时间价值数据
    timeValue: 0,
    suggestedMinPrice: 0, // 建议雇佣单价最小值
    suggestedMaxPrice: 0, // 建议雇佣单价最大值
    
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
      let timeValue = 0;
      
      if (timeData && timeData.timeValue !== undefined && timeData.timeValue !== null) {
        // 处理可能的字符串类型
        if (typeof timeData.timeValue === 'string') {
          timeValue = parseFloat(timeData.timeValue);
        } else {
          timeValue = timeData.timeValue;
        }
      }
      
      // 计算建议雇佣单价范围 (时间价值/4 * 1~2倍精力系数)
      const suggestedMinPrice = (timeValue / 4 * 1.0).toFixed(2);
      const suggestedMaxPrice = (timeValue / 4 * 2.0).toFixed(2);
      
      this.setData({
        timeValue: timeValue,
        suggestedMinPrice: suggestedMinPrice,
        suggestedMaxPrice: suggestedMaxPrice
      });
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
    
    // 验证输入 - 任务描述改为非必填
    if (!estimatedHours || !outsourcePrice) {
      wx.showToast({
        title: '请填写完整信息',
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
    const suggestedMinPrice = parseFloat(this.data.suggestedMinPrice);
    const suggestedMaxPrice = parseFloat(this.data.suggestedMaxPrice);
    
    // 计算节省金额 (使用建议雇佣单价范围)
    const avgSuggestedPrice = (suggestedMinPrice + suggestedMaxPrice) / 2;
    const savings = (avgSuggestedPrice * hours) - price;
    const roi = savings > 0 ? (savings / price * 100) : 0;
    
    // 决策逻辑 - 与建议雇佣单价范围比较
    let decision = '';
    let recommendation = '';
    let reason = '';
    
    if (pricePerHour >= suggestedMinPrice && pricePerHour <= suggestedMaxPrice) {
      decision = 'hire';
      recommendation = '建议雇人';
      reason = `外包单价 ¥${pricePerHour.toFixed(2)}/小时 在建议范围内 ¥${suggestedMinPrice.toFixed(2)} - ¥${suggestedMaxPrice.toFixed(2)}/小时`;
    } else if (pricePerHour < suggestedMinPrice) {
      decision = 'hire';
      recommendation = '强烈建议雇人';
      reason = `外包单价 ¥${pricePerHour.toFixed(2)}/小时 低于建议范围 ¥${suggestedMinPrice.toFixed(2)} - ¥${suggestedMaxPrice.toFixed(2)}/小时`;
    } else {
      decision = 'self';
      recommendation = '建议自己做';
      reason = `外包单价 ¥${pricePerHour.toFixed(2)}/小时 高于建议范围 ¥${suggestedMinPrice.toFixed(2)} - ¥${suggestedMaxPrice.toFixed(2)}/小时`;
    }
    
    const analysis = {
      hours,
      price: price.toFixed(2),
      pricePerHour: pricePerHour.toFixed(2),
      savings: savings.toFixed(2),
      roi: roi.toFixed(1),
      decision,
      recommendation,
      reason
    };
    
    // 设置用户选择显示条件
    const showUserChoice = savings > 0;
    
    // 调试信息
    console.log('=== 用户选择调试 ===');
    console.log('savings:', savings);
    console.log('showUserChoice:', showUserChoice);
    console.log('decision:', decision);
    
    this.setData({
      showResult: true,
      decision,
      analysis,
      showUserChoice: showUserChoice
    });
    
    // 保存决策记录
    this.saveDecisionRecord({
      taskDescription,
      taskType,
      estimatedHours: hours,
      outsourcePrice: price.toFixed(2),
      userTimeValue: timeValue.toFixed(2),
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

  // 用户选择雇佣
  chooseHire: function() {
    const { analysis, estimatedHours, showUserChoice } = this.data;
    const hours = parseFloat(estimatedHours);
    
    // 只有在有节省时才统计赎回时间
    if (showUserChoice) {
      this.addRedeemedTime(hours);
      wx.showToast({
        title: '已记录赎回时间',
        icon: 'success'
      });
    } else {
      wx.showToast({
        title: '已记录选择',
        icon: 'success'
      });
    }
    
    // 更新决策记录
    this.updateDecisionRecord(true);
  },

  // 用户选择自己完成
  chooseSelf: function() {
    wx.showToast({
      title: '已记录选择',
      icon: 'success'
    });
    
    // 更新决策记录
    this.updateDecisionRecord(false);
  },

  // 添加赎回时间
  addRedeemedTime: function(hours) {
    try {
      const redeemedTime = wx.getStorageSync('redeemedTime') || 0;
      const newRedeemedTime = redeemedTime + hours;
      wx.setStorageSync('redeemedTime', newRedeemedTime);
    } catch (error) {
      console.error('保存赎回时间失败:', error);
    }
  },

  // 更新决策记录
  updateDecisionRecord: function(choseHire) {
    try {
      const history = wx.getStorageSync('decisionHistory') || [];
      if (history.length > 0) {
        // 更新最新的决策记录
        history[0].userChoice = choseHire;
        history[0].choseHire = choseHire;
        wx.setStorageSync('decisionHistory', history);
      }
    } catch (error) {
      console.error('更新决策记录失败:', error);
    }
  }


});