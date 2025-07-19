// pages/statistics/statistics.js
Page({
  data: {
    // 统计数据
    totalSavedTime: 0,      // 总共节省的时间（小时）
    totalSavedMoney: 0,     // 总共节省的金额
    totalDecisions: 0,      // 总决策次数
    hireDecisions: 0,       // 雇人决策次数
    selfDecisions: 0,       // 自己做决策次数
    
    // 月度统计
    monthlyStats: {
      savedTime: 0,
      savedMoney: 0,
      decisions: 0
    },
    
    // 年度统计
    yearlyStats: {
      savedTime: 0,
      savedMoney: 0,
      decisions: 0
    },
    
    // 最近记录
    recentDecisions: [],
    
    // 任务类型统计
    taskTypeStats: {},
    
    // 显示选项
    showPeriod: 'all', // all, monthly, yearly
    
    // 时间创造追踪
    creativeTime: 0,
    creativeActivities: []
  },

  onLoad: function() {
    this.loadStatistics();
  },

  onShow: function() {
    this.loadStatistics();
  },

  // 加载统计数据
  loadStatistics: function() {
    try {
      // 加载决策历史记录
      const decisionHistory = wx.getStorageSync('decisionHistory') || [];
      
      // 加载创造时间记录
      const creativeTimeData = wx.getStorageSync('creativeTimeData') || {
        totalTime: 0,
        activities: []
      };
      
      // 计算统计数据
      this.calculateStats(decisionHistory, creativeTimeData);
      
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  },

  // 计算统计数据
  calculateStats: function(decisionHistory, creativeTimeData) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let totalSavedTime = 0;
    let totalSavedMoney = 0;
    let hireDecisions = 0;
    let selfDecisions = 0;
    
    let monthlySavedTime = 0;
    let monthlySavedMoney = 0;
    let monthlyDecisions = 0;
    
    let yearlySavedTime = 0;
    let yearlySavedMoney = 0;
    let yearlyDecisions = 0;
    
    const taskTypeStats = {};
    
    // 遍历决策记录
    decisionHistory.forEach(record => {
      const recordDate = new Date(record.timestamp);
      const isCurrentMonth = recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
      const isCurrentYear = recordDate.getFullYear() === currentYear;
      
      if (record.analysis.decision === 'hire' && record.analysis.savings > 0) {
        const savedTime = record.estimatedHours;
        const savedMoney = record.analysis.savings;
        
        totalSavedTime += savedTime;
        totalSavedMoney += savedMoney;
        hireDecisions++;
        
        if (isCurrentMonth) {
          monthlySavedTime += savedTime;
          monthlySavedMoney += savedMoney;
          monthlyDecisions++;
        }
        
        if (isCurrentYear) {
          yearlySavedTime += savedTime;
          yearlySavedMoney += savedMoney;
          yearlyDecisions++;
        }
        
        // 任务类型统计
        if (!taskTypeStats[record.taskType]) {
          taskTypeStats[record.taskType] = {
            count: 0,
            savedTime: 0,
            savedMoney: 0
          };
        }
        taskTypeStats[record.taskType].count++;
        taskTypeStats[record.taskType].savedTime += savedTime;
        taskTypeStats[record.taskType].savedMoney += savedMoney;
      } else {
        selfDecisions++;
        if (isCurrentMonth) monthlyDecisions++;
        if (isCurrentYear) yearlyDecisions++;
      }
    });
    
    // 最近的决策记录（前5条）
    const recentDecisions = decisionHistory.slice(0, 5);
    
    this.setData({
      totalSavedTime,
      totalSavedMoney,
      totalDecisions: decisionHistory.length,
      hireDecisions,
      selfDecisions,
      
      monthlyStats: {
        savedTime: monthlySavedTime,
        savedMoney: monthlySavedMoney,
        decisions: monthlyDecisions
      },
      
      yearlyStats: {
        savedTime: yearlySavedTime,
        savedMoney: yearlySavedMoney,
        decisions: yearlyDecisions
      },
      
      recentDecisions,
      taskTypeStats,
      
      creativeTime: creativeTimeData.totalTime,
      creativeActivities: creativeTimeData.activities
    });
  },

  // 切换统计周期
  onPeriodChange: function(e) {
    const periodMap = ['all', 'monthly', 'yearly'];
    this.setData({
      showPeriod: periodMap[e.detail.value]
    });
  },

  // 添加创造时间记录
  addCreativeTime: function() {
    wx.showModal({
      title: '记录创造时间',
      content: '请输入你把节省的时间用于什么创造性活动',
      editable: true,
      placeholderText: '例如：学习新技能、创作内容等',
      success: (res) => {
        if (res.confirm && res.content) {
          this.showTimeInputModal(res.content);
        }
      }
    });
  },

  // 显示时间输入模态框
  showTimeInputModal: function(activity) {
    wx.showModal({
      title: '输入时间',
      content: '请输入投入的时间（小时）',
      editable: true,
      placeholderText: '例如：2.5',
      success: (res) => {
        if (res.confirm && res.content) {
          const hours = parseFloat(res.content);
          if (hours > 0) {
            this.saveCreativeTime(activity, hours);
          }
        }
      }
    });
  },

  // 保存创造时间记录
  saveCreativeTime: function(activity, hours) {
    try {
      const creativeTimeData = wx.getStorageSync('creativeTimeData') || {
        totalTime: 0,
        activities: []
      };
      
      creativeTimeData.totalTime += hours;
      creativeTimeData.activities.unshift({
        activity,
        hours,
        timestamp: new Date().toISOString()
      });
      
      // 只保留最近20条记录
      if (creativeTimeData.activities.length > 20) {
        creativeTimeData.activities.splice(20);
      }
      
      wx.setStorageSync('creativeTimeData', creativeTimeData);
      
      this.setData({
        creativeTime: creativeTimeData.totalTime,
        creativeActivities: creativeTimeData.activities
      });
      
      wx.showToast({
        title: '记录成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('保存创造时间失败:', error);
      wx.showToast({
        title: '记录失败',
        icon: 'error'
      });
    }
  },

  // 查看详细历史
  viewDetailHistory: function() {
    wx.navigateTo({
      url: '/pages/statistics/history'
    });
  },

  // 导出数据
  exportData: function() {
    wx.showModal({
      title: '数据导出',
      content: '功能开发中，敬请期待',
      showCancel: false
    });
  },

  // 清空数据
  clearData: function() {
    wx.showModal({
      title: '清空数据',
      content: '确定要清空所有统计数据吗？此操作不可恢复！',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('decisionHistory');
          wx.removeStorageSync('creativeTimeData');
          this.loadStatistics();
          wx.showToast({
            title: '数据已清空',
            icon: 'success'
          });
        }
  }
    });
  }
});