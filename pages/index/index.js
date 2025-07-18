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
      totalSavedMoney: 0,
      totalDecisions: 0,
      recentDecisions: 0
    },
    
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
      { content: '时间能消除一切仇怨。在时间面前，世间的一切仇恨都显得微不足道和软弱无力。', author: '莎士比亚' },
      { content: '时间是最好的医生。', author: '英国谚语' },
      { content: '时间乃是万物中最宝贵的东西。', author: '柏拉图' },
      { content: '时间是变化的财富。时钟模仿它，却只有变化而无财富。', author: '泰戈尔' },
      { content: '时间就是速度，时间就是力量。', author: '郭沫若' },
      { content: '时间是审查一切罪犯的最老练的法官。', author: '莎士比亚' },
      { content: '时间是人的财富，全部财富，正如时间是国家的财富一样。', author: '巴尔扎克' },
      { content: '时间像弹簧，可以缩短也可以拉长。', author: '柬埔寨谚语' },
      { content: '时间是最伟大、最公正的裁判。', author: '俄国谚语' },
      { content: '时间能使隐藏的事物显露，也能使灿烂夺目的东西黯然无光。', author: '贺拉斯' },
      { content: '时间就是金钱。', author: '富兰克林' },
      { content: '时间是人类发展的空间。', author: '马克思' },
      { content: '时间是最宝贵的财富。', author: '希腊谚语' },
      { content: '时间会刺破青春的华丽精致，会把平行线刻上美人的额角。', author: '莎士比亚' },
      { content: '时间老人自己是个秃顶，所以直到世界末日也会有大群秃顶的徒子徒孙。', author: '莎士比亚' },
      { content: '时间是衡量事业的标准。', author: '培根' },
      { content: '时间能够证明爱情，也能够把爱推翻。', author: '李嘉诚' },
      { content: '时间是最不值钱的东西，也是最值钱的东西。', author: '《时间管理》' },
      { content: '你热爱生命吗？那么别浪费时间，因为时间是组成生命的材料。', author: '富兰克林' },
      { content: '时间是一个伟大的作者，它会给每个人写出完美的结局来。', author: '卓别林' }
    ],
    
    // 显示状态
    showWelcome: true,
    isFirstTimeUser: true
  },

  onLoad: function() {
    this.loadUserData();
    this.loadStatistics();
    this.checkFirstTimeUser();
    this.loadRandomQuote();
  },

  onShow: function() {
    this.loadUserData();
    this.loadStatistics();
  },

  // 加载用户数据
  loadUserData: function() {
    try {
      const timeCalculatorData = wx.getStorageSync('timeCalculatorData');
      const userName = wx.getStorageSync('userName');
      
      this.setData({
        userInfo: {
          name: userName || '时间管理者',
          timeValue: timeCalculatorData?.timeValue || 0,
          hasSetTimeValue: timeCalculatorData?.timeValue > 0
        }
      });
    } catch (error) {
      console.error('加载用户数据失败:', error);
    }
  },

  // 加载统计数据
  loadStatistics: function() {
    try {
      const decisionHistory = wx.getStorageSync('decisionHistory') || [];
      
      let totalSavedTime = 0;
      let totalSavedMoney = 0;
      let recentDecisions = 0;
      
      // 计算最近7天的决策数量
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      decisionHistory.forEach(record => {
        if (record.analysis.decision === 'hire' && record.analysis.savings > 0) {
          totalSavedTime += record.estimatedHours;
          totalSavedMoney += record.analysis.savings;
        }
        
        const recordDate = new Date(record.timestamp);
        if (recordDate >= sevenDaysAgo) {
          recentDecisions++;
        }
      });
      
      this.setData({
        statistics: {
          totalSavedTime: totalSavedTime,
          totalSavedMoney: totalSavedMoney,
          totalDecisions: decisionHistory.length,
          recentDecisions: recentDecisions
        }
      });
    } catch (error) {
      console.error('加载统计数据失败:', error);
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

  // 跳转到设置页面
  goToSettings: function() {
    wx.switchTab({
      url: '/pages/settings/settings'
    });
  },

  // 查看使用帮助
  showHelp: function() {
    wx.showModal({
      title: '使用帮助',
      content: '1. 首先在"计算器"中设置您的时间价值\n2. 在"决策"中输入任务信息获取建议\n3. 在"统计"中查看您的时间管理成果\n4. 在"设置"中管理个人信息和应用设置',
      showCancel: false
    });
  },

  // 分享小程序
  onShareAppMessage: function() {
    return {
      title: '时间赎回器 - 计算时间价值，做出明智决策',
      path: '/pages/index/index',
      imageUrl: '/images/share-image.jpg'
    };
  },

  // 分享到朋友圈
  onShareTimeline: function() {
    return {
      title: '时间赎回器 - 金钱仅仅是用来购买时间的工具',
      imageUrl: '/images/share-image.jpg'
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
