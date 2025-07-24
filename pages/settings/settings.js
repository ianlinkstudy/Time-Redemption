Page({
  data: {
    // 用户信息
    userInfo: {
      name: '',
      timeValue: 0,
      totalSavedTime: 0,
      joinDate: ''
    },
    
    // 设置项
    settings: {
      notifications: true,
      darkMode: false,
      autoCalculate: true,
      showTips: true
    },
    
    // 数据统计
    dataStats: {
      totalDecisions: 0,
      totalRecords: 0,
      storageSize: 0
    },
    
    // 版本信息
    version: '1.0.0'
  },

  onLoad: function() {
    this.loadUserData();
    this.loadSettings();
    this.calculateDataStats();
  },

  onShow: function() {
    this.loadUserData();
    this.calculateDataStats();
  },

  // 加载用户数据
  loadUserData: function() {
    try {
      const timeCalculatorData = wx.getStorageSync('timeCalculatorData');
      const decisionHistory = wx.getStorageSync('decisionHistory') || [];
      const redeemedTime = wx.getStorageSync('redeemedTime') || 0;
      
      console.log('=== 设置页面数据加载调试 ===');
      console.log('决策历史记录:', decisionHistory);
      console.log('赎回时间:', redeemedTime);
      
      // 计算总节省时间 - 使用新的数据格式
      let totalSavedTime = 0;
      decisionHistory.forEach(record => {
        // 检查新的决策记录格式
        if (record.userChoice && record.choseHire && record.estimatedHours) {
          totalSavedTime += parseFloat(record.estimatedHours);
        }
        // 兼容旧的决策记录格式
        else if (record.analysis && record.analysis.decision === 'hire' && record.analysis.savings > 0) {
          totalSavedTime += record.estimatedHours;
        }
      });
      
      // 优先使用存储的赎回时间
      const finalSavedTime = redeemedTime > 0 ? redeemedTime : totalSavedTime;
      
      console.log('计算的总节省时间:', totalSavedTime);
      console.log('存储的赎回时间:', redeemedTime);
      console.log('最终使用的节省时间:', finalSavedTime);
      
      // 获取加入日期
      const joinDate = wx.getStorageSync('joinDate') || new Date().toISOString().split('T')[0];
      if (!wx.getStorageSync('joinDate')) {
        wx.setStorageSync('joinDate', joinDate);
      }
      
      // 获取时间价值
      let timeValue = 0;
      if (timeCalculatorData && timeCalculatorData.timeValue !== undefined) {
        timeValue = typeof timeCalculatorData.timeValue === 'string' ? 
          parseFloat(timeCalculatorData.timeValue) : Number(timeCalculatorData.timeValue);
      }
      
      this.setData({
        userInfo: {
          name: wx.getStorageSync('userName') || '时间管理者',
          timeValue: timeValue,
          totalSavedTime: finalSavedTime,
          joinDate: joinDate
        }
      });
      
      console.log('设置的用户信息:', this.data.userInfo);
      console.log('=== 设置页面调试结束 ===');
    } catch (error) {
      console.error('加载用户数据失败:', error);
      // 设置默认值
      this.setData({
        userInfo: {
          name: '时间管理者',
          timeValue: 0,
          totalSavedTime: 0,
          joinDate: new Date().toISOString().split('T')[0]
        }
      });
    }
  },

  // 加载设置
  loadSettings: function() {
    try {
      const savedSettings = wx.getStorageSync('appSettings');
      if (savedSettings) {
        this.setData({
          settings: {
            ...this.data.settings,
            ...savedSettings
          }
        });
      }
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  },

  // 计算数据统计
  calculateDataStats: function() {
    try {
      const decisionHistory = wx.getStorageSync('decisionHistory') || [];
      const creativeTimeData = wx.getStorageSync('creativeTimeData') || {};
      const timeCalculatorData = wx.getStorageSync('timeCalculatorData');
      const appSettings = wx.getStorageSync('appSettings');
      
      console.log('=== 设置页面数据统计调试 ===');
      console.log('决策历史数量:', decisionHistory.length);
      console.log('创意时间数据:', creativeTimeData);
      
      // 估算存储大小
      const storageData = {
        decisionHistory,
        creativeTimeData,
        timeCalculatorData,
        appSettings,
        redeemedTime: wx.getStorageSync('redeemedTime'),
        userName: wx.getStorageSync('userName'),
        joinDate: wx.getStorageSync('joinDate')
      };
      
      const storageSize = JSON.stringify(storageData).length;
      
      const dataStats = {
        totalDecisions: decisionHistory.length,
        totalRecords: decisionHistory.length + (creativeTimeData.activities?.length || 0),
        storageSize: Math.round(storageSize / 1024) // KB
      };
      
      console.log('数据统计结果:', dataStats);
      console.log('=== 设置页面数据统计调试结束 ===');
      
      this.setData({
        dataStats: dataStats
      });
    } catch (error) {
      console.error('计算数据统计失败:', error);
      // 设置默认值
      this.setData({
        dataStats: {
          totalDecisions: 0,
          totalRecords: 0,
          storageSize: 0
        }
      });
    }
  },

  // 修改用户名
  changeUserName: function() {
    wx.showModal({
      title: '修改用户名',
      content: '请输入新的用户名',
      editable: true,
      placeholderText: this.data.userInfo.name,
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          const newName = res.content.trim();
          wx.setStorageSync('userName', newName);
          this.setData({
            'userInfo.name': newName
          });
          wx.showToast({
            title: '修改成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 跳转到时间价值计算器
  goToCalculator: function() {
    wx.switchTab({
      url: '/pages/calculator/calculator'
    });
  },

  // 切换通知设置
  toggleNotifications: function() {
    const newValue = !this.data.settings.notifications;
    this.updateSetting('notifications', newValue);
  },

  // 切换深色模式
  toggleDarkMode: function() {
    const newValue = !this.data.settings.darkMode;
    this.updateSetting('darkMode', newValue);
    
    // 这里可以添加切换主题的逻辑
    wx.showModal({
      title: '深色模式',
      content: '深色模式功能正在开发中，敬请期待',
      showCancel: false
    });
  },

  // 切换自动计算
  toggleAutoCalculate: function() {
    const newValue = !this.data.settings.autoCalculate;
    this.updateSetting('autoCalculate', newValue);
  },

  // 切换显示提示
  toggleShowTips: function() {
    const newValue = !this.data.settings.showTips;
    this.updateSetting('showTips', newValue);
  },

  // 更新设置
  updateSetting: function(key, value) {
    const newSettings = {
      ...this.data.settings,
      [key]: value
    };
    
    this.setData({
      settings: newSettings
    });
    
    wx.setStorageSync('appSettings', newSettings);
  },

  // 数据备份
  backupData: function() {
    wx.showModal({
      title: '数据备份',
      content: '将数据备份到云端，功能开发中',
      showCancel: false
    });
  },

  // 数据恢复
  restoreData: function() {
    wx.showModal({
      title: '数据恢复',
      content: '从云端恢复数据，功能开发中',
      showCancel: false
    });
  },

  // 导出数据
  exportData: function() {
    try {
      const allData = {
        userInfo: this.data.userInfo,
        timeCalculatorData: wx.getStorageSync('timeCalculatorData'),
        decisionHistory: wx.getStorageSync('decisionHistory'),
        creativeTimeData: wx.getStorageSync('creativeTimeData'),
        appSettings: wx.getStorageSync('appSettings'),
        exportTime: new Date().toISOString()
      };
      
      wx.showModal({
        title: '导出数据',
        content: `数据已准备就绪，包含 ${this.data.dataStats.totalRecords} 条记录`,
        confirmText: '复制到剪贴板',
        success: (res) => {
          if (res.confirm) {
            wx.setClipboardData({
              data: JSON.stringify(allData, null, 2),
              success: () => {
                wx.showToast({
                  title: '已复制到剪贴板',
                  icon: 'success'
                });
              }
            });
          }
        }
      });
    } catch (error) {
      console.error('导出数据失败:', error);
      wx.showToast({
        title: '导出失败',
        icon: 'error'
      });
    }
  },

  // 清除缓存
  clearCache: function() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存数据吗？这将不会删除您的决策记录',
      success: (res) => {
        if (res.confirm) {
          // 清除临时数据，但保留重要数据
          wx.removeStorageSync('tempData');
          wx.showToast({
            title: '缓存已清除',
            icon: 'success'
          });
        }
      }
    });
  },

  // 重置所有数据
  resetAllData: function() {
    wx.showModal({
      title: '重置所有数据',
      content: '⚠️ 危险操作！这将删除所有数据，包括决策记录、时间价值设置等。此操作不可恢复！',
      confirmText: '确定重置',
      confirmColor: '#e74c3c',
      success: (res) => {
        if (res.confirm) {
          wx.showModal({
            title: '二次确认',
            content: '请再次确认是否要重置所有数据？',
            confirmText: '确定重置',
            confirmColor: '#e74c3c',
            success: (res2) => {
              if (res2.confirm) {
                try {
                  // 清除所有数据
                  wx.clearStorageSync();
                  wx.showToast({
                    title: '重置成功',
                    icon: 'success'
                  });
                  
                  // 重新加载数据
                  setTimeout(() => {
                    this.loadUserData();
                    this.loadSettings();
                    this.calculateDataStats();
                  }, 1000);
                } catch (error) {
                  console.error('重置数据失败:', error);
                  wx.showToast({
                    title: '重置失败',
                    icon: 'error'
                  });
                }
              }
            }
          });
        }
      }
    });
  },

  // 意见反馈
  feedback: function() {
    wx.showModal({
      title: '意见反馈',
      content: '请在小程序评价中留下您的宝贵意见，或联系客服微信：timemanager2024',
      showCancel: false
    });
  },

  // 关于小程序
  aboutApp: function() {
    wx.showModal({
      title: '关于时间赎回器',
      content: `版本：${this.data.version}\n\n基于《买回你的时间》一书理念开发\n\n帮助你计算时间价值，做出明智决策\n\n"金钱仅仅是用来购买时间的工具"`,
      showCancel: false
    });
  },

  // 使用帮助
  showHelp: function() {
    wx.showModal({
      title: '使用帮助',
      content: '1. 首先在"计算器"中设置您的时间价值\n2. 在"决策"中输入任务信息获取建议\n3. 在"统计"中查看您的时间管理成果\n4. 记录节省时间的创造性使用',
      showCancel: false
    });
  },

  // 分享小程序
  shareApp: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  }
}); 