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
    // 检查时间价值数据是否有更新
    this.checkTimeValueUpdate();
    // 每次显示页面时重新加载时间价值数据
    this.loadTimeValue();
  },

  // 检查时间价值数据更新
  checkTimeValueUpdate: function() {
    try {
      const timeData = wx.getStorageSync('timeCalculatorData');
      const currentTimeValue = this.data.timeValue;
      
      if (timeData && timeData.timeValue !== undefined && timeData.timeValue !== null) {
        const newTimeValue = typeof timeData.timeValue === 'string' ? parseFloat(timeData.timeValue) : timeData.timeValue;
        
        // 如果时间价值发生变化，显示提示
        if (Math.abs(newTimeValue - currentTimeValue) > 0.01) {
          console.log('决策页面 - 时间价值已更新:', currentTimeValue, '→', newTimeValue);
          
          // 可选：显示提示信息
          if (currentTimeValue > 0) {
            wx.showToast({
              title: '时间价值已更新',
              icon: 'success',
              duration: 2000
            });
          }
        }
      }
    } catch (error) {
      console.error('检查时间价值更新失败:', error);
    }
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
      
      // 生成任务唯一标识（基于任务描述、类型、预估时间和外包价格）
      const taskKey = `${record.taskDescription || ''}_${record.taskType}_${record.estimatedHours}_${record.outsourcePrice}`;
      
      // 查找是否存在相同的任务记录
      const existingIndex = history.findIndex(item => {
        const itemKey = `${item.taskDescription || ''}_${item.taskType}_${item.estimatedHours}_${item.outsourcePrice}`;
        return itemKey === taskKey;
      });
      
      const newRecord = {
        ...record,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        taskKey: taskKey // 保存任务唯一标识
      };
      
      if (existingIndex !== -1) {
        // 如果存在相同任务，更新现有记录
        const oldRecord = history[existingIndex];
        history[existingIndex] = newRecord;
        console.log('更新现有任务记录:', taskKey);
        console.log('旧选择:', oldRecord.choseHire, '新选择:', newRecord.choseHire);
      } else {
        // 如果不存在，添加新记录
        history.unshift(newRecord);
        console.log('添加新任务记录:', taskKey);
      }
      
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
    
    // 计算节省金额 (基于时间价值)
    const timeValueSavings = (timeValue * hours) - price;
    const timeValueRoi = (timeValueSavings / price * 100);
    
    // 决策逻辑 - 分层比较
    let decision = '';
    let recommendation = '';
    let reason = '';
    let energyLevel = '';
    
    if (pricePerHour <= suggestedMinPrice) {
      // 1.0x以下 - 强烈建议买回时间
      decision = 'hire';
      recommendation = '强烈建议买回时间';
      reason = `外包单价 ¥${pricePerHour.toFixed(2)}/小时 低于建议最低价 ¥${suggestedMinPrice.toFixed(2)}/小时，非常划算！`;
      energyLevel = '低精力消耗';
    } else if (pricePerHour > suggestedMinPrice && pricePerHour <= suggestedMaxPrice) {
      // 1.0x-2.0x之间 - 根据精力消耗选择
      decision = 'hire';
      recommendation = '建议买回时间';
      reason = `外包单价 ¥${pricePerHour.toFixed(2)}/小时 在建议范围内 ¥${suggestedMinPrice.toFixed(2)} - ¥${suggestedMaxPrice.toFixed(2)}/小时`;
      energyLevel = '中等精力消耗';
    } else if (pricePerHour > suggestedMaxPrice && pricePerHour <= timeValue) {
      // 2.0x-时间价值之间 - 考虑性价比
      decision = 'consider';
      recommendation = '谨慎考虑';
      reason = `外包单价 ¥${pricePerHour.toFixed(2)}/小时 高于建议范围但低于您的时间价值 ¥${timeValue.toFixed(2)}/小时，需权衡性价比`;
      energyLevel = '高精力消耗';
    } else {
      // 超过时间价值 - 不建议外包
      decision = 'self';
      recommendation = '建议自己完成';
      reason = `外包单价 ¥${pricePerHour.toFixed(2)}/小时 超过您的时间价值 ¥${timeValue.toFixed(2)}/小时，不划算`;
      energyLevel = '极高精力消耗';
    }
    
    const analysis = {
      hours,
      price: price.toFixed(2),
      pricePerHour: pricePerHour.toFixed(2),
      savings: timeValueSavings.toFixed(2),
      roi: timeValueRoi.toFixed(1),
      decision,
      recommendation,
      reason,
      energyLevel,
      timeValue: timeValue.toFixed(2),
      suggestedMinPrice: suggestedMinPrice.toFixed(2),
      suggestedMaxPrice: suggestedMaxPrice.toFixed(2)
    };
    
    // 设置用户选择显示条件 - 总是显示用户选择按钮
    const showUserChoice = true;
    

    
    this.setData({
      showResult: true,
      decision,
      analysis,
      showUserChoice: showUserChoice
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
    const { analysis, estimatedHours, taskDescription, taskType, timeValue } = this.data;
    const hours = parseFloat(estimatedHours);
    
    // 统计赎回时间
    this.addRedeemedTime(hours);
    
    // 显示买回时间提示
    wx.showToast({
      title: `已买回${hours}小时！`,
      icon: 'success',
      duration: 3000
    });
    
    // 保存决策记录到历史
    this.saveDecisionRecord({
      taskDescription,
      taskType,
      estimatedHours: hours,
      outsourcePrice: analysis.price,
      userTimeValue: timeValue.toFixed(2),
      analysis,
      userChoice: true,
      choseHire: true
    });
  },

  // 用户选择自己完成
  chooseSelf: function() {
    const { analysis, estimatedHours, taskDescription, taskType, timeValue } = this.data;
    const hours = parseFloat(estimatedHours);
    
    wx.showToast({
      title: `选择自己完成，需要${hours}小时`,
      icon: 'none',
      duration: 3000
    });
    
    // 保存决策记录到历史
    this.saveDecisionRecord({
      taskDescription,
      taskType,
      estimatedHours: hours,
      outsourcePrice: analysis.price,
      userTimeValue: timeValue.toFixed(2),
      analysis,
      userChoice: true,
      choseHire: false
    });
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




});