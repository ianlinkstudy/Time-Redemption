// index.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    // 用户数据
    userInfo: {
      name: '时间管理者',
      timeValue: 0,
      hasSetTimeValue: false
    },
    
    // 统计数据
    statistics: {
      totalSavedTime: 0,
      equivalentValue: 0,
      totalSavedTimeDisplay: '0.0',
      equivalentValueDisplay: '0',
      totalDecisions: 0,
      recentDecisions: 0
    },
    
    // 导航栏状态
    navbarClass: '',
    
    // 功能导航
    features: [
      {
        id: 'calculator',
        name: '时间价值计算器',
        icon: '🧮',
        description: '计算你的时间值多少钱',
        color: '#667eea',
        url: '/pages/calculator/calculator'
      },
      {
        id: 'decision',
        name: '雇人决策引擎',
        icon: '🤖',
        description: '智能判断是否应该雇人',
        color: '#fd79a8',
        url: '/pages/decision/decision'
      },
      {
        id: 'statistics',
        name: '时间统计中心',
        icon: '📊',
        description: '追踪你的时间管理成果',
        color: '#6c5ce7',
        url: '/pages/statistics/statistics'
      },
      {
        id: 'settings',
        name: '设置中心',
        icon: '⚙️',
        description: '个人信息与应用设置',
        color: '#00b894',
        url: '/pages/settings/settings'
      }
    ],
    
    // 快速操作
    quickActions: [
      {
        id: 'quick-calculate',
        name: '快速计算',
        icon: '⚡',
        description: '立即计算时间价值'
      },
      {
        id: 'quick-decision',
        name: '快速决策',
        icon: '🎯',
        description: '判断任务是否外包'
      },
      {
        id: 'view-stats',
        name: '查看统计',
        icon: '📈',
        description: '查看时间管理成果'
      }
    ],
    
    // 今日提示
    todayTip: {
      title: '今日金句',
      content: '',
      author: ''
    },
    
    // 时间名人金句库
    timeQuotes: [
      { content: '时间是世界上一切成就的土壤。', author: '麦金西' },
      { content: '合理安排时间，就等于节约时间。', author: '培根' },
      { content: '时间就是生命，无端的空耗别人的时间，其实无异于谋财害命的。', author: '鲁迅' },
      { content: '时间是伟大的导师。', author: '伯克' },
      { content: '时间是最公平合理的，它从不多给谁一分。', author: '普希金' },
      { content: '浪费时间是所有支出中最奢侈及最昂贵的。', author: '富兰克林' },
      { content: '时间能够治愈一切创伤。', author: '米南德' },
      { content: '时间是检验真理的尺度。', author: '培根' },
      { content: '一寸光阴一寸金，寸金难买寸光阴。', author: '中国谚语' },
      { content: '时间就是能力等发展的地盘。', author: '马克思' },
      { content: '时间是人类必须珍惜的东西。', author: '袁枚' },
      { content: '时间是由分秒积成的，善于利用零星时间的人，才会做出更大的成绩来。', author: '华罗庚' },
      { content: '时间最不偏私，给任何人都是二十四小时。', author: '赫胥黎' },
      { content: '时间是一切财富中最宝贵的财富。', author: '德奥弗拉斯多' },
      { content: '时间是一个伟大的作者，它必将写出完美的答案。', author: '卓别林' }
    ],
    
    // 显示状态
    showWelcome: true,
    isFirstTimeUser: true
  },

  onLoad: function() {
    this.loadUserData();
    this.loadStatistics();
    this.loadTodayTip();
    this.checkFirstTimeUser();
  },

  onShow: function() {
    // 检查时间价值数据是否有更新
    this.checkTimeValueUpdate();
    this.loadUserData();
    this.loadStatistics();
    
    // 强制刷新数据
    setTimeout(() => {
      this.loadStatistics();
    }, 100);
  },

  // 页面滚动监听
  onPageScroll: function(e) {
    const scrollTop = e.scrollTop;
    if (scrollTop > 50) {
      this.setData({
        navbarClass: 'scrolled'
      });
    } else {
      this.setData({
        navbarClass: ''
      });
    }
  },

  // 检查时间价值数据更新
  checkTimeValueUpdate: function() {
    try {
      const timeData = wx.getStorageSync('timeCalculatorData');
      const currentTimeValue = this.data.userInfo.timeValue;
      
      if (timeData && timeData.timeValue !== undefined && timeData.timeValue !== null) {
        const newTimeValue = typeof timeData.timeValue === 'string' ? parseFloat(timeData.timeValue) : timeData.timeValue;
        
        // 如果时间价值发生变化，显示提示
        if (Math.abs(newTimeValue - currentTimeValue) > 0.01) {
          console.log('首页 - 时间价值已更新:', currentTimeValue, '→', newTimeValue);
          
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

  // 加载用户数据
  loadUserData: function() {
    try {
      const timeCalculatorData = wx.getStorageSync('timeCalculatorData');
      const userName = wx.getStorageSync('userName');
      
      console.log('=== 首页数据加载调试 ===');
      console.log('原始时间数据:', timeCalculatorData);
      console.log('数据类型:', typeof timeCalculatorData);
      
      let timeValue = 0;
      if (timeCalculatorData && timeCalculatorData.timeValue !== undefined && timeCalculatorData.timeValue !== null) {
        // 确保转换为数字类型
        timeValue = typeof timeCalculatorData.timeValue === 'string' ? parseFloat(timeCalculatorData.timeValue) : Number(timeCalculatorData.timeValue);
        console.log('解析后时间价值:', timeValue);
        console.log('时间价值类型:', typeof timeValue);
      } else {
        console.log('未找到有效的时间价值数据');
      }
      
      const userInfo = {
        name: userName || '时间管理者',
        timeValue: timeValue,
        hasSetTimeValue: timeValue > 0
      };
      
      console.log('将要设置的用户数据:', userInfo);
      
      this.setData({ userInfo: userInfo });
      
      console.log('设置后的页面数据:', this.data.userInfo);
      console.log('=== 调试结束 ===');
    } catch (error) {
      console.error('加载用户数据失败:', error);
      // 设置默认值
      this.setData({
        userInfo: {
          name: '时间管理者',
          timeValue: 0,
          hasSetTimeValue: false
        }
      });
    }
  },

  // 加载统计数据
  loadStatistics: function() {
    try {
      const decisionHistory = wx.getStorageSync('decisionHistory') || [];
      const redeemedTime = wx.getStorageSync('redeemedTime') || 0;
      const timeCalculatorData = wx.getStorageSync('timeCalculatorData');
      
      let timeValue = 0;
      if (timeCalculatorData && timeCalculatorData.timeValue) {
        timeValue = parseFloat(timeCalculatorData.timeValue);
      }
      
      let totalSavedTime = 0;
      let equivalentValue = 0; // 等效价值
      let recentDecisions = 0;
      
      // 计算最近7天的决策数量
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      decisionHistory.forEach(record => {
        if (record.userChoice && record.choseHire) {
          totalSavedTime += record.estimatedHours;
        }
        
        const recordDate = new Date(record.timestamp);
        if (recordDate >= sevenDaysAgo) {
          recentDecisions++;
        }
      });
      
      // 计算等效价值：已买回时间 × 时间价值
      equivalentValue = redeemedTime * timeValue;
      
      const newStatistics = {
        totalSavedTime: redeemedTime, // 使用存储的赎回时间
        equivalentValue: equivalentValue, // 等效价值
        totalSavedTimeDisplay: (redeemedTime || 0).toFixed(1), // 格式化显示
        equivalentValueDisplay: (equivalentValue || 0).toFixed(0), // 格式化显示
        totalDecisions: decisionHistory.length,
        recentDecisions: recentDecisions
      };
      
      this.setData({
        statistics: newStatistics
      });
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  },

  // 加载今日金句
  loadTodayTip: function() {
    try {
      const today = new Date();
      const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
      const quoteIndex = dayOfYear % this.data.timeQuotes.length;
      const todayQuote = this.data.timeQuotes[quoteIndex];
      
      this.setData({
        todayTip: {
          title: '今日金句',
          content: todayQuote.content,
          author: todayQuote.author
        }
      });
    } catch (error) {
      console.error('加载今日金句失败:', error);
    }
  },

  // 检查是否是首次使用
  checkFirstTimeUser: function() {
    try {
      const hasUsedBefore = wx.getStorageSync('hasUsedBefore');
      const timeCalculatorData = wx.getStorageSync('timeCalculatorData');
      
      this.setData({
        isFirstTimeUser: !hasUsedBefore && !timeCalculatorData
      });
      
      if (!hasUsedBefore) {
        wx.setStorageSync('hasUsedBefore', true);
        this.showWelcomeDialog();
      }
    } catch (error) {
      console.error('检查首次使用状态失败:', error);
    }
  },

  // 显示欢迎对话框
  showWelcomeDialog: function() {
    wx.showModal({
      title: '欢迎使用时间赎回器',
      content: '这是一个帮助你计算时间价值、做出明智决策的小程序。建议先设置你的时间价值，然后开始使用各项功能。',
      confirmText: '开始使用',
      cancelText: '稍后',
      success: (res) => {
        if (res.confirm) {
          this.goToCalculator();
        }
      }
    });
  },

  // 功能导航点击
  onFeatureClick: function(e) {
    const featureId = e.currentTarget.dataset.id;
    const feature = this.data.features.find(f => f.id === featureId);
    
    if (feature) {
      if (feature.id === 'calculator' || feature.id === 'settings') {
        wx.switchTab({
          url: feature.url
        });
      } else {
        wx.switchTab({
          url: feature.url
        });
      }
    }
  },

  // 快速操作点击
  onQuickActionClick: function(e) {
    const actionId = e.currentTarget.dataset.id;
    
    switch (actionId) {
      case 'quick-calculate':
        this.goToCalculator();
        break;
      case 'quick-decision':
        this.goToDecision();
        break;
      case 'view-stats':
        this.goToStatistics();
        break;
    }
  },

  // 跳转到计算器
  goToCalculator: function() {
    wx.switchTab({
      url: '/pages/calculator/calculator'
    });
  },

  // 跳转到决策页面
  goToDecision: function() {
    if (!this.data.userInfo.hasSetTimeValue) {
      wx.showModal({
        title: '提示',
        content: '请先设置您的时间价值，才能使用决策功能',
        confirmText: '去设置',
        success: (res) => {
          if (res.confirm) {
            this.goToCalculator();
          }
        }
      });
      return;
    }
    
    wx.switchTab({
      url: '/pages/decision/decision'
    });
  },

  // 跳转到统计页面
  goToStatistics: function() {
    wx.switchTab({
      url: '/pages/statistics/statistics'
    });
  },

  // 手动刷新数据
  refreshData: function() {
    console.log('=== 手动刷新数据 ===');
    
    // 强制同步数据
    this.syncData();
    
    // 重新加载数据
    this.loadUserData();
    this.loadStatistics();
    
    // 显示当前数据状态
    setTimeout(() => {
      console.log('当前页面数据:', this.data);
      wx.showToast({
        title: '数据已刷新',
        icon: 'success'
      });
    }, 200);
  },

  // 数据同步和修复
  syncData: function() {
    try {
      console.log('=== 开始数据同步 ===');
      
      // 检查并修复时间价值数据
      const timeCalculatorData = wx.getStorageSync('timeCalculatorData');
      if (timeCalculatorData && timeCalculatorData.timeValue !== undefined) {
        // 确保时间价值是数字类型
        const timeValue = typeof timeCalculatorData.timeValue === 'string' ? 
          parseFloat(timeCalculatorData.timeValue) : Number(timeCalculatorData.timeValue);
        
        if (!isNaN(timeValue)) {
          // 更新存储的数据
          const updatedData = {
            ...timeCalculatorData,
            timeValue: timeValue
          };
          wx.setStorageSync('timeCalculatorData', updatedData);
          console.log('时间价值数据已同步:', timeValue);
        }
      }
      
      // 检查并修复赎回时间数据
      const redeemedTime = wx.getStorageSync('redeemedTime');
      if (redeemedTime !== undefined && redeemedTime !== null) {
        const redeemedTimeNum = typeof redeemedTime === 'string' ? 
          parseFloat(redeemedTime) : Number(redeemedTime);
        
        if (!isNaN(redeemedTimeNum)) {
          wx.setStorageSync('redeemedTime', redeemedTimeNum);
          console.log('赎回时间数据已同步:', redeemedTimeNum);
        }
      }
      
      // 检查并修复决策历史数据
      const decisionHistory = wx.getStorageSync('decisionHistory') || [];
      if (decisionHistory.length > 0) {
        // 确保每个记录的数据类型正确
        const fixedHistory = decisionHistory.map(record => ({
          ...record,
          estimatedHours: typeof record.estimatedHours === 'string' ? 
            parseFloat(record.estimatedHours) : Number(record.estimatedHours),
          outsourcePrice: typeof record.outsourcePrice === 'string' ? 
            parseFloat(record.outsourcePrice) : Number(record.outsourcePrice),
          userTimeValue: typeof record.userTimeValue === 'string' ? 
            parseFloat(record.userTimeValue) : Number(record.userTimeValue)
        }));
        wx.setStorageSync('decisionHistory', fixedHistory);
        console.log('决策历史数据已同步，记录数:', fixedHistory.length);
      }
      
      console.log('=== 数据同步完成 ===');
    } catch (error) {
      console.error('数据同步失败:', error);
    }
  },

  // 初始化测试数据（用于调试）
  initTestData: function() {
    try {
      console.log('=== 初始化测试数据 ===');
      
      // 设置测试时间价值
      const testTimeData = {
        annualSalary: '100000',
        monthlySalary: '',
        otherIncome: '20000',
        salaryType: 'annual',
        timeValue: 60, // 100000 + 20000 = 120000 / 2000 = 60
        hiringSuggestionMin: 15,
        hiringSuggestionMax: 30,
        showResult: true,
        totalAnnualIncome: 120000,
        updateTime: new Date().toISOString()
      };
      wx.setStorageSync('timeCalculatorData', testTimeData);
      
      // 设置测试赎回时间
      wx.setStorageSync('redeemedTime', 5.5);
      
      // 设置测试决策历史
      const testHistory = [
        {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          taskDescription: '打扫房间',
          taskType: 'cleaning',
          estimatedHours: 2.5,
          outsourcePrice: 75,
          userTimeValue: 60,
          userChoice: true,
          choseHire: true
        },
        {
          id: Date.now() + 1,
          timestamp: new Date().toISOString(),
          taskDescription: '整理文档',
          taskType: 'document',
          estimatedHours: 3.0,
          outsourcePrice: 90,
          userTimeValue: 60,
          userChoice: true,
          choseHire: true
        }
      ];
      wx.setStorageSync('decisionHistory', testHistory);
      
      console.log('测试数据初始化完成');
      console.log('时间价值:', testTimeData.timeValue);
      console.log('赎回时间:', 5.5);
      console.log('决策历史数量:', testHistory.length);
      
      // 重新加载数据
      this.loadUserData();
      this.loadStatistics();
      
      wx.showToast({
        title: '测试数据已初始化',
        icon: 'success'
      });
      
    } catch (error) {
      console.error('初始化测试数据失败:', error);
    }
  },

  // 跳转到设置页面
  goToSettings: function() {
    wx.switchTab({
      url: '/pages/settings/settings'
    });
  },

  // 显示帮助
  showHelp: function() {
    wx.showModal({
      title: '使用帮助',
      content: '1. 在计算器页面中算出你每小时的时间价值；\n\n2. 在决策页面中理性的判断，是否赎回自己的时间（与自己的时间价值做对比）；\n\n3. 你可在统计页面查看自己时间赎回的成果？\n\n时间赎回器的理念是：金钱只是用来购买时间的工具！',
      confirmText: '知道了',
      showCancel: false
    });
  },

  // 分享功能
  onShareAppMessage: function() {
    return {
      title: '时间赎回器 - 买回你的时间',
      path: '/pages/index/index',
      imageUrl: '/images/share-cover.png'
    };
  },

  // 分享到朋友圈
  onShareTimeline: function() {
    return {
      title: '时间赎回器 - 买回你的时间',
      imageUrl: '/images/share-cover.png'
    };
  },

  // 加载随机名言
  loadRandomQuote: function() {
    const today = new Date();
    const dateString = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    
    // 基于日期创建随机种子，确保每天显示相同的名言
    let seed = 0;
    for (let i = 0; i < dateString.length; i++) {
      seed += dateString.charCodeAt(i);
    }
    
    // 使用种子计算今日名言索引
    const quoteIndex = seed % this.data.timeQuotes.length;
    const todayQuote = this.data.timeQuotes[quoteIndex];
    
    this.setData({
      todayTip: {
        title: '今日金句',
        content: todayQuote.content,
        author: todayQuote.author
      }
    });
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadUserData();
    this.loadStatistics();
    this.loadRandomQuote();
    
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});
