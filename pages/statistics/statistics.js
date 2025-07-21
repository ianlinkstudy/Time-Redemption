// pages/statistics/statistics.js
Page({
  data: {
    // 统计数据
    totalRedeemedTime: 0,   // 总共赎回的时间（小时）
    totalSpentMoney: 0,     // 总共花费的金额
    totalDecisions: 0,      // 总决策次数
    hireDecisions: 0,       // 雇佣决策次数
    selfDecisions: 0,       // 自己完成决策次数
    costEfficiency: 0,      // 成本效率百分比
    
    // 分析结果
    costAnalysis: {
      status: 'normal',
      text: '合理',
      detail: ''
    },
    priceAnalysis: {
      status: 'normal', 
      text: '合理',
      detail: ''
    },
    
    // 最近记录
    recentDecisions: [],
    
    // 任务类型统计
    taskTypeStats: {},
    
    // 用户时间价值
    userTimeValue: 0,
    
    // 任务类型映射
    taskTypeMap: {
      'cleaning': '家务清洁',
      'document': '文档整理',
      'design': '设计制作',
      'tech': '技术开发',
      'delivery': '跑腿代办',
      'other': '其他任务'
    }
  },

  onLoad: function() {
    this.loadStatistics();
  },

  onShow: function() {
    // 检查时间价值数据是否有更新
    this.checkTimeValueUpdate();
    this.loadStatistics();
  },

  // 检查时间价值数据更新
  checkTimeValueUpdate: function() {
    try {
      const timeData = wx.getStorageSync('timeCalculatorData');
      const currentTimeValue = this.data.userTimeValue;
      
      if (timeData && timeData.timeValue !== undefined && timeData.timeValue !== null) {
        const newTimeValue = typeof timeData.timeValue === 'string' ? parseFloat(timeData.timeValue) : timeData.timeValue;
        
        // 如果时间价值发生变化，显示提示
        if (Math.abs(newTimeValue - currentTimeValue) > 0.01) {
          console.log('时间价值已更新:', currentTimeValue, '→', newTimeValue);
          
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

  // 加载统计数据
  loadStatistics: function() {
    try {
      // 加载决策历史记录
      const decisionHistory = wx.getStorageSync('decisionHistory') || [];
      
      // 加载赎回时间
      const redeemedTime = wx.getStorageSync('redeemedTime') || 0;
      
      // 加载用户时间价值
      const timeData = wx.getStorageSync('timeCalculatorData');
      let userTimeValue = 0;
      if (timeData && timeData.timeValue !== undefined && timeData.timeValue !== null) {
        userTimeValue = typeof timeData.timeValue === 'string' ? parseFloat(timeData.timeValue) : timeData.timeValue;
      }
      

      
      // 计算统计数据
      this.calculateStats(decisionHistory, userTimeValue, redeemedTime);
      
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  },

  // 计算统计数据
  calculateStats: function(decisionHistory, userTimeValue, redeemedTime) {
    let totalRedeemedTime = parseFloat(redeemedTime) || 0; // 确保是数字类型
    let totalSpentMoney = 0;
    let hireDecisions = 0;
    let selfDecisions = 0;
    
    const taskTypeStats = {};
    
    // 遍历决策记录
    decisionHistory.forEach(record => {
      if (record.userChoice && record.choseHire !== undefined) {
        if (record.choseHire) {
          // 用户选择了雇佣
          hireDecisions++;
          totalSpentMoney += parseFloat(record.outsourcePrice);
        } else {
          // 用户选择了自己完成
          selfDecisions++;
        }
        
        // 任务类型统计（使用中文名称）
        const taskTypeChinese = this.data.taskTypeMap[record.taskType] || record.taskType;
        if (!taskTypeStats[taskTypeChinese]) {
          taskTypeStats[taskTypeChinese] = {
            count: 0,
            redeemedTime: 0,
            spentMoney: 0
          };
        }
        taskTypeStats[taskTypeChinese].count++;
        if (record.choseHire) {
          taskTypeStats[taskTypeChinese].redeemedTime += record.estimatedHours;
          taskTypeStats[taskTypeChinese].spentMoney += parseFloat(record.outsourcePrice);
        }
      }
    });
    
    // 计算成本效率（赎回时间价值 / 花费金额）
    let costEfficiency = 0;
    let costEfficiencyDetail = '';
    if (totalSpentMoney > 0 && userTimeValue > 0) {
      const redeemedTimeValue = totalRedeemedTime * userTimeValue;
      costEfficiency = (redeemedTimeValue / totalSpentMoney * 100).toFixed(1);
      costEfficiencyDetail = `赎回时间价值：¥${redeemedTimeValue.toFixed(0)}，花费：¥${totalSpentMoney.toFixed(0)}，效率：${costEfficiency}%`;
    }
    
    // 分析花费合理性
    let costAnalysis = { status: 'normal', text: '合理', detail: '' };
    if (userTimeValue > 0 && totalRedeemedTime > 0) {
      const avgCostPerHour = totalSpentMoney / totalRedeemedTime;
      costAnalysis.detail = `平均每小时花费：¥${avgCostPerHour.toFixed(2)}，您的时间价值：¥${userTimeValue.toFixed(2)}/小时`;
      
      if (avgCostPerHour < userTimeValue * 0.5) {
        costAnalysis = { status: 'excellent', text: '非常划算', detail: costAnalysis.detail };
      } else if (avgCostPerHour < userTimeValue) {
        costAnalysis = { status: 'good', text: '比较划算', detail: costAnalysis.detail };
      } else if (avgCostPerHour > userTimeValue * 2) {
        costAnalysis = { status: 'poor', text: '成本较高', detail: costAnalysis.detail };
      }
    }
    
    // 分析雇佣价格合理性
    let priceAnalysis = { status: 'normal', text: '合理', detail: '' };
    if (userTimeValue > 0 && totalRedeemedTime > 0) {
      const suggestedMinPrice = userTimeValue / 4 * 1.0;
      const suggestedMaxPrice = userTimeValue / 4 * 2.0;
      const avgPricePerHour = totalSpentMoney / totalRedeemedTime;
      
      priceAnalysis.detail = `平均雇佣价格：¥${avgPricePerHour.toFixed(2)}/小时，建议范围：¥${suggestedMinPrice.toFixed(2)} - ¥${suggestedMaxPrice.toFixed(2)}/小时`;
      
      if (avgPricePerHour >= suggestedMinPrice && avgPricePerHour <= suggestedMaxPrice) {
        priceAnalysis = { status: 'good', text: '价格合理', detail: priceAnalysis.detail };
      } else if (avgPricePerHour < suggestedMinPrice) {
        priceAnalysis = { status: 'excellent', text: '价格很划算', detail: priceAnalysis.detail };
      } else {
        priceAnalysis = { status: 'poor', text: '价格偏高', detail: priceAnalysis.detail };
      }
    }
    
    // 最近的决策记录（前5条）
    const recentDecisions = decisionHistory.slice(0, 5).map(record => ({
      ...record,
      taskTypeChinese: this.data.taskTypeMap[record.taskType] || record.taskType
    }));
    

    

    

    
    // 确保totalRedeemedTime是数字类型并预处理格式化
    const formattedRedeemedTime = parseFloat(totalRedeemedTime) || 0;
    const redeemedTimeDisplay = formattedRedeemedTime.toFixed(1);
    
    this.setData({
      totalRedeemedTime: formattedRedeemedTime,
      totalRedeemedTimeDisplay: redeemedTimeDisplay, // 添加格式化后的显示值
      totalSpentMoney,
      totalDecisions: decisionHistory.length,
      hireDecisions,
      selfDecisions,
      costEfficiency,
      costAnalysis,
      priceAnalysis,
      recentDecisions,
      taskTypeStats,
      userTimeValue
    });
  },

  // 格式化时间
  formatTime: function(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // 1分钟内
      return '刚刚';
    } else if (diff < 3600000) { // 1小时内
      return Math.floor(diff / 60000) + '分钟前';
    } else if (diff < 86400000) { // 1天内
      return Math.floor(diff / 3600000) + '小时前';
    } else if (diff < 2592000000) { // 30天内
      return Math.floor(diff / 86400000) + '天前';
    } else {
      return date.toLocaleDateString();
    }
  },

  // 查看详细历史
  viewDetailHistory: function() {
    wx.navigateTo({
      url: '/pages/decision/history'
    });
  },

  // 显示成本详情
  showCostDetail: function() {
    wx.showModal({
      title: '总体花费合理性分析',
      content: this.data.costAnalysis.detail || '暂无数据',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 显示价格详情
  showPriceDetail: function() {
    wx.showModal({
      title: '雇佣价格合理性分析',
      content: this.data.priceAnalysis.detail || '暂无数据',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 显示效率详情
  showEfficiencyDetail: function() {
    const detail = `赎回时间价值：¥${(this.data.totalRedeemedTime * this.data.userTimeValue).toFixed(0)}，花费：¥${this.data.totalSpentMoney.toFixed(0)}，效率：${this.data.costEfficiency}%`;
    wx.showModal({
      title: '成本效率分析',
      content: detail,
      showCancel: false,
      confirmText: '知道了'
    });
  }
});