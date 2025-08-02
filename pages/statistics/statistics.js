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
    },
    
    // 数据更新检测
    lastDataUpdate: 0
  },

  onLoad: function() {
    this.loadStatistics();
  },

  onShow: function() {
    console.log('=== 统计页面 onShow 触发 ===');
    
    // 检查数据是否有更新
    this.checkDataUpdate();
    
    // 检查时间价值数据是否有更新
    this.checkTimeValueUpdate();
    this.loadStatistics();
  },

  // 检查数据更新
  checkDataUpdate: function() {
    try {
      const lastUpdate = wx.getStorageSync('lastDataUpdate') || 0;
      const currentUpdate = this.data.lastDataUpdate || 0;
      
      if (lastUpdate > currentUpdate) {
        console.log('统计页面检测到数据更新，时间戳:', lastUpdate);
        this.setData({
          lastDataUpdate: lastUpdate
        });
        
        // 强制重新加载数据
        this.loadStatistics();
      }
    } catch (error) {
      console.error('检查数据更新失败:', error);
    }
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
      console.log('=== 统计页面数据加载调试 ===');
      
      // 加载决策历史记录
      const decisionHistory = wx.getStorageSync('decisionHistory') || [];
      console.log('决策历史记录:', decisionHistory);
      console.log('决策历史记录数量:', decisionHistory.length);
      
      // 加载赎回时间
      const redeemedTime = wx.getStorageSync('redeemedTime') || 0;
      console.log('赎回时间:', redeemedTime);
      console.log('赎回时间类型:', typeof redeemedTime);
      
      // 加载用户时间价值
      const timeData = wx.getStorageSync('timeCalculatorData');
      console.log('时间计算器数据:', timeData);
      
      let userTimeValue = 0;
      if (timeData && timeData.timeValue !== undefined && timeData.timeValue !== null) {
        // 确保转换为数字类型
        userTimeValue = typeof timeData.timeValue === 'string' ? parseFloat(timeData.timeValue) : Number(timeData.timeValue);
        console.log('解析后用户时间价值:', userTimeValue);
        console.log('用户时间价值类型:', typeof userTimeValue);
      } else {
        console.log('未找到有效的用户时间价值数据');
      }
      
      console.log('=== 统计页面调试结束 ===');
      
      // 计算统计数据
      this.calculateStats(decisionHistory, userTimeValue, redeemedTime);
      
    } catch (error) {
      console.error('加载统计数据失败:', error);
      // 设置默认值
      this.setData({
        totalRedeemedTime: 0,
        totalRedeemedTimeDisplay: '0.0',
        totalSpentMoney: 0,
        totalDecisions: 0,
        hireDecisions: 0,
        selfDecisions: 0,
        costEfficiency: 0,
        userTimeValue: 0,
        recentDecisions: [],
        taskTypeStats: {}
      });
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
    
    // 计算赎回性价比（赎回的总额/如果自己做价值总额的百分比）
    let costEfficiency = 0;
    let costEfficiencyDetail = '';
    if (totalSpentMoney > 0 && userTimeValue > 0) {
      const redeemedTimeValue = totalRedeemedTime * userTimeValue;
      costEfficiency = (totalSpentMoney / redeemedTimeValue * 100).toFixed(1);
      costEfficiencyDetail = `赎回花费：¥${totalSpentMoney.toFixed(0)}，如果自己做价值：¥${redeemedTimeValue.toFixed(0)}，性价比：${costEfficiency}%`;
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


});