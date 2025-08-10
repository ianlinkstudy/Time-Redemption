Page({
  data: {
    // 用户信息
    userInfo: {
      name: '',
      avatarUrl: '',
      timeValue: 0,
      timeValueDisplay: '0.00'
    },
    
    // 统计数据（与首页一致）
    statistics: {
      totalSavedTime: 0,
      equivalentValue: 0,
      totalSavedTimeDisplay: '0.0',
      equivalentValueDisplay: '0',
      totalDecisions: 0
    },
    
    // 版本信息
    version: 'V0.1',
    
    // 数据更新检测
    lastDataUpdate: 0,
    
    // 登录状态
    isLoggedIn: false,
    openid: '',
    isMockLogin: false
  },

  onLoad: function() {
    this.loadUserData();
    this.checkLoginStatus();
  },

  onShow: function() {
    console.log('=== 设置页面 onShow 触发 ===');
    
    // 检查数据是否有更新
    this.checkDataUpdate();
    
    this.loadUserData();
  },

  // 清理临时文件路径
  cleanTempAvatarPath: function() {
    const avatarUrl = wx.getStorageSync('userAvatarUrl');
    
    if (avatarUrl && avatarUrl.startsWith('http://tmp/')) {
      console.log('清理临时文件路径:', avatarUrl);
      wx.removeStorageSync('userAvatarUrl');
      
      // 更新页面数据
      this.setData({
        'userInfo.avatarUrl': ''
      });
    }
  },

  // 检查登录状态
  checkLoginStatus: function() {
    const openid = wx.getStorageSync('openid');
    const isMockLogin = wx.getStorageSync('isMockLogin');
    const loginTime = wx.getStorageSync('loginTime');
    const isLoggedIn = !!openid;
    
    // 检查登录是否过期（7天）
    const now = Date.now();
    const loginExpireTime = 7 * 24 * 60 * 60 * 1000; // 7天
    const isExpired = loginTime && (now - loginTime > loginExpireTime);
    
    if (isLoggedIn && isExpired) {
      // 登录已过期，清除登录状态
      this.clearLoginStatus();
      return;
    }
    
    // 清理临时文件路径
    this.cleanTempAvatarPath();
    
    this.setData({
      isLoggedIn: isLoggedIn,
      openid: openid || '',
      isMockLogin: isMockLogin || false
    });
    
    if (isLoggedIn) {
      const loginType = isMockLogin ? '模拟登录' : '微信登录';
      console.log(`用户已登录，类型：${loginType}，openid:`, openid);
    } else {
      console.log('用户未登录');
    }
  },

  // 清除登录状态
  clearLoginStatus: function() {
    // 清理头像文件
    const avatarUrl = wx.getStorageSync('userAvatarUrl');
    if (avatarUrl && !avatarUrl.startsWith('http://tmp/')) {
      // 删除本地头像文件
      wx.removeSavedFile({
        filePath: avatarUrl,
        success: function() {
          console.log('头像文件已删除');
        },
        fail: function(err) {
          console.log('删除头像文件失败:', err);
        }
      });
    }
    
    // 清除存储数据
    wx.removeStorageSync('openid');
    wx.removeStorageSync('userName');
    wx.removeStorageSync('userAvatarUrl');
    wx.removeStorageSync('loginTime');
    wx.removeStorageSync('isMockLogin');
    
    this.setData({
      isLoggedIn: false,
      openid: '',
      isMockLogin: false,
      userInfo: {
        ...this.data.userInfo,
        name: '时间管理者',
        avatarUrl: ''
      }
    });
    
    console.log('登录状态已清除');
  },

  // 微信登录
  wechatLogin: function() {
    const that = this;
    
    wx.showLoading({
      title: '登录中...'
    });
    
    // 第一步：调用 wx.login() 获取临时登录凭证
    wx.login({
      success: function(res) {
        console.log('wx.login 成功:', res);
        
        if (res.code) {
          // 第二步：将 code 发送到开发者服务器
          that.sendCodeToServer(res.code);
        } else {
          wx.hideLoading();
          wx.showToast({
            title: '获取登录凭证失败',
            icon: 'error'
          });
        }
      },
      fail: function(err) {
        console.log('wx.login 失败:', err);
        wx.hideLoading();
        wx.showToast({
          title: '登录失败',
          icon: 'error'
        });
      }
    });
  },

  // 发送code到开发者服务器
  sendCodeToServer: function(code) {
    const that = this;
    
    // 这里需要替换为您的真实服务器地址
    // 注意：需要在微信开发者工具中配置合法域名
    const serverUrl = 'https://your-server.com/api/login';
    
    wx.request({
      url: serverUrl,
      method: 'POST',
      data: {
        code: code
      },
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        wx.hideLoading();
        console.log('服务器响应:', res.data);
        
        if (res.data.success) {
          // 保存用户信息
          const userInfo = res.data.userInfo;
          const openid = res.data.openid;
          const sessionKey = res.data.sessionKey; // 注意：session_key不应该下发到小程序
          
          // 保存到本地存储（不保存session_key）
          wx.setStorageSync('openid', openid);
          wx.setStorageSync('userName', userInfo.nickName);
          wx.setStorageSync('userAvatarUrl', userInfo.avatarUrl);
          wx.setStorageSync('loginTime', Date.now());
          
          // 更新页面数据
          that.setData({
            isLoggedIn: true,
            openid: openid,
            'userInfo.name': userInfo.nickName,
            'userInfo.avatarUrl': userInfo.avatarUrl
          });
          
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          });
          
          // 显示登录成功提示
          wx.showModal({
            title: '微信登录成功',
            content: `登录成功！\n\n用户标识：${openid.substring(0, 8)}...\n\n现在可以：\n1. 点击头像按钮选择微信头像\n2. 在昵称输入框输入您的昵称\n\n这样就能个性化您的时间赎回器了！`,
            showCancel: false,
            confirmText: '知道了'
          });
          
        } else {
          wx.showToast({
            title: res.data.message || '登录失败',
            icon: 'error'
          });
        }
      },
      fail: function(err) {
        wx.hideLoading();
        console.log('请求服务器失败:', err);
        
        // 如果服务器不可用，使用模拟登录
        that.useMockLogin();
      }
    });
  },

  // 模拟登录（当服务器不可用时）
  useMockLogin: function() {
    wx.showModal({
      title: '服务器连接失败',
      content: '无法连接到登录服务器，是否使用模拟登录？\n\n模拟登录可以：\n1. 体验完整功能\n2. 设置个性化头像和昵称\n3. 数据本地保存',
      confirmText: '使用模拟登录',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.performMockLogin();
        }
      }
    });
  },

  // 执行模拟登录
  performMockLogin: function() {
    wx.showLoading({
      title: '模拟登录中...'
    });
    
    // 模拟网络延迟
    setTimeout(() => {
      wx.hideLoading();
      
      // 生成模拟的openid
      const mockOpenid = 'mock_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      // 使用默认用户信息
      const userInfo = {
        nickName: '微信用户',
        avatarUrl: ''
      };
      
      // 保存到本地存储
      wx.setStorageSync('openid', mockOpenid);
      wx.setStorageSync('userName', userInfo.nickName);
      wx.setStorageSync('userAvatarUrl', userInfo.avatarUrl);
      wx.setStorageSync('loginTime', Date.now());
      wx.setStorageSync('isMockLogin', true); // 标记为模拟登录
      
      // 更新页面数据
      this.setData({
        isLoggedIn: true,
        openid: mockOpenid,
        'userInfo.name': userInfo.nickName,
        'userInfo.avatarUrl': userInfo.avatarUrl
      });
      
      wx.showToast({
        title: '模拟登录成功',
        icon: 'success'
      });
      
      // 显示模拟登录成功提示
      wx.showModal({
        title: '模拟登录成功',
        content: '模拟登录成功！\n\n现在可以：\n1. 点击头像按钮选择头像\n2. 在昵称输入框输入昵称\n\n注意：这是模拟登录，数据仅保存在本地。',
        showCancel: false,
        confirmText: '知道了'
      });
      
    }, 1500);
  },

  // 使用模拟用户信息（当后端不可用时）
  useMockUserInfo: function() {
    wx.showModal({
      title: '登录提示',
      content: '后端服务器暂时不可用，将使用模拟用户信息进行演示。\n\n您可以：\n1. 点击头像按钮选择头像\n2. 在昵称输入框输入昵称',
      showCancel: false,
      confirmText: '知道了',
      success: () => {
        // 使用默认用户信息
        const mockUserInfo = {
          nickName: '微信用户',
          avatarUrl: ''
        };
        
        wx.setStorageSync('userName', mockUserInfo.nickName);
        wx.setStorageSync('userAvatarUrl', mockUserInfo.avatarUrl);
        
        this.setData({
          'userInfo.name': mockUserInfo.nickName,
          'userInfo.avatarUrl': mockUserInfo.avatarUrl
        });
      }
    });
  },

  // 微信最新的头像选择回调
  onChooseAvatar: function(e) {
    console.log('头像选择回调:', e.detail);
    const { avatarUrl } = e.detail;
    
    if (avatarUrl) {
      // 将临时文件保存到本地文件系统
      this.saveAvatarToLocal(avatarUrl);
    }
  },

  // 保存头像到本地文件系统
  saveAvatarToLocal: function(tempFilePath) {
    const that = this;
    
    wx.showLoading({
      title: '保存头像中...'
    });
    
    // 生成唯一的文件名
    const fileName = 'avatar_' + Date.now() + '.jpg';
    const savedFilePath = `${wx.env.USER_DATA_PATH}/${fileName}`;
    
    // 将临时文件复制到本地
    wx.saveFile({
      tempFilePath: tempFilePath,
      success: function(res) {
        wx.hideLoading();
        console.log('头像保存成功:', res.savedFilePath);
        
        // 保存头像路径到本地存储
        wx.setStorageSync('userAvatarUrl', res.savedFilePath);
        
        // 更新页面数据
        that.setData({
          'userInfo.avatarUrl': res.savedFilePath
        });
        
        wx.showToast({
          title: '头像设置成功',
          icon: 'success'
        });
      },
      fail: function(err) {
        wx.hideLoading();
        console.log('头像保存失败:', err);
        
        // 如果保存失败，直接使用临时路径
        wx.setStorageSync('userAvatarUrl', tempFilePath);
        
        that.setData({
          'userInfo.avatarUrl': tempFilePath
        });
        
        wx.showToast({
          title: '头像设置成功',
          icon: 'success'
        });
      }
    });
  },

  // 昵称输入回调
  onInputNickname: function(e) {
    const nickName = e.detail.value.trim();
    
    if (nickName) {
      // 保存昵称到本地存储
      wx.setStorageSync('userName', nickName);
      
      // 更新页面数据
      this.setData({
        'userInfo.name': nickName
      });
      
      console.log('昵称已更新:', nickName);
    }
  },

  // 显示微信登录指南
  showWechatLoginGuide: function() {
    if (this.data.isLoggedIn) {
      const loginType = this.data.isMockLogin ? '模拟登录' : '微信登录';
      const openidDisplay = this.data.openid.substring(0, 8) + '...';
      
      wx.showModal({
        title: '用户信息设置',
        content: `您已${loginType}\n用户标识：${openidDisplay}\n\n可以：\n1. 点击头像按钮选择微信头像\n2. 在昵称输入框输入昵称\n3. 重置用户信息重新登录`,
        showCancel: false,
        confirmText: '知道了'
      });
    } else {
      wx.showModal({
        title: '微信登录说明',
        content: '微信登录流程：\n\n1. 调用微信登录接口获取临时凭证\n2. 发送凭证到服务器换取用户标识\n3. 获取用户唯一标识(openid)\n\n如果服务器不可用，将自动使用模拟登录。',
        confirmText: '开始登录',
        cancelText: '手动设置',
        success: (res) => {
          if (res.confirm) {
            this.wechatLogin();
          } else {
            this.showManualSetupGuide();
          }
        }
      });
    }
  },

  // 显示手动设置指南
  showManualSetupGuide: function() {
    wx.showModal({
      title: '手动设置指南',
      content: '您可以：\n\n1. 点击头像按钮 → 选择微信头像\n2. 在昵称输入框 → 输入您的昵称\n\n这样就能个性化您的时间赎回器了！',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 重置用户信息
  resetUserInfo: function() {
    wx.showModal({
      title: '重置用户信息',
      content: '确定要重置头像、昵称和登录状态吗？\n\n这将清除：\n• 用户登录状态\n• 头像和昵称设置\n• 所有用户数据',
      success: (res) => {
        if (res.confirm) {
          this.clearLoginStatus();
          
          wx.showToast({
            title: '重置成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 检查数据更新
  checkDataUpdate: function() {
    try {
      const lastUpdate = wx.getStorageSync('lastDataUpdate') || 0;
      const currentUpdate = this.data.lastDataUpdate || 0;
      
      if (lastUpdate > currentUpdate) {
        console.log('设置页面检测到数据更新，时间戳:', lastUpdate);
        this.setData({
          lastDataUpdate: lastUpdate
        });
        
        // 强制重新加载数据
        this.loadUserData();
        this.calculateDataStats();
      }
    } catch (error) {
      console.error('检查数据更新失败:', error);
    }
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
      
      // 获取用户时间价值
      let timeValue = 0;
      let timeValueDisplay = '0.00';
      
      if (timeCalculatorData && timeCalculatorData.timeValue !== undefined && timeCalculatorData.timeValue !== null) {
        timeValue = typeof timeCalculatorData.timeValue === 'string' ? parseFloat(timeCalculatorData.timeValue) : timeCalculatorData.timeValue;
        timeValueDisplay = timeValue.toFixed(2);
      }
      
      // 计算总赎回时间
      let totalSavedTime = 0;
      decisionHistory.forEach(record => {
        if (record.userChoice && record.choseHire && record.estimatedHours) {
          totalSavedTime += parseFloat(record.estimatedHours);
        }
      });
      
      // 优先使用存储的赎回时间
      const finalSavedTime = redeemedTime > 0 ? redeemedTime : totalSavedTime;
      
      // 计算等效价值
      const equivalentValue = finalSavedTime * timeValue;
      
      console.log('计算的总赎回时间:', totalSavedTime);
      console.log('存储的赎回时间:', redeemedTime);
      console.log('最终使用的赎回时间:', finalSavedTime);
      console.log('等效价值:', equivalentValue);
      
      // 获取加入日期
      const joinDate = wx.getStorageSync('joinDate') || new Date().toISOString().split('T')[0];
      if (!wx.getStorageSync('joinDate')) {
        wx.setStorageSync('joinDate', joinDate);
      }
      
      // 预格式化显示字段
      const totalSavedTimeDisplay = finalSavedTime > 0 ? finalSavedTime.toFixed(1) : '0.0';
      const equivalentValueDisplay = equivalentValue > 0 ? Math.round(equivalentValue).toString() : '0';
      
      // 获取用户头像，处理本地文件路径
      let avatarUrl = wx.getStorageSync('userAvatarUrl') || '';
      
      // 如果是临时文件路径，尝试转换为本地路径
      if (avatarUrl && avatarUrl.startsWith('http://tmp/')) {
        console.log('检测到临时文件路径，尝试转换:', avatarUrl);
        // 这里可以添加文件转换逻辑，暂时使用空字符串
        avatarUrl = '';
      }
      
      this.setData({
        userInfo: {
          name: wx.getStorageSync('userName') || '时间管理者',
          avatarUrl: avatarUrl,
          timeValue: timeValue,
          timeValueDisplay: timeValueDisplay
        },
        statistics: {
          totalSavedTime: finalSavedTime,
          equivalentValue: equivalentValue,
          totalSavedTimeDisplay: totalSavedTimeDisplay,
          equivalentValueDisplay: equivalentValueDisplay,
          totalDecisions: decisionHistory.length
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
          avatarUrl: '',
          timeValue: 0,
          timeValueDisplay: '0.00',
          totalSavedTime: 0,
          totalSavedTimeDisplay: '0.0',
          joinDate: new Date().toISOString().split('T')[0]
        }
      });
    }
  },

  // 修改用户名（保留兼容性）
  changeUserName: function() {
    wx.showModal({
      title: '修改用户名',
      content: '请直接在昵称输入框中输入新的用户名',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 修改用户头像（保留兼容性）
  changeUserAvatar: function() {
    wx.showModal({
      title: '修改头像',
      content: '请直接点击头像按钮选择微信头像',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 跳转到时间价值计算器
  goToCalculator: function() {
    wx.switchTab({
      url: '/pages/calculator/calculator'
    });
  },

  // 刷新数据
  refreshData: function() {
    console.log('=== 设置页面手动刷新数据 ===');
    
    // 重新加载数据
    this.loadUserData();
    
    // 显示当前数据状态
    setTimeout(() => {
      console.log('当前设置页面数据:', this.data);
      wx.showToast({
        title: '数据已刷新',
        icon: 'success'
      });
    }, 200);
  },

  // 数据同步和修复
  syncData: function() {
    try {
      console.log('=== 设置页面开始数据同步 ===');
      
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
      
      console.log('=== 设置页面数据同步完成 ===');
    } catch (error) {
      console.error('设置页面数据同步失败:', error);
    }
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
      confirmColor: '#ff3b30',
      success: (res) => {
        if (res.confirm) {
          wx.showModal({
            title: '二次确认',
            content: '请再次确认是否要重置所有数据？此操作将清空：\n\n• 时间价值设置\n• 所有决策记录\n• 统计数据\n• 用户信息',
            confirmText: '确定重置',
            confirmColor: '#ff3b30',
            success: (res2) => {
              if (res2.confirm) {
                try {
                  // 清除所有数据
                  wx.clearStorageSync();
                  
                  // 重置页面数据
                  this.setData({
                    userInfo: {
                      name: '时间管理者',
                      timeValue: 0,
                      timeValueDisplay: '0.00',
                      hasSetTimeValue: false
                    },
                    statistics: {
                      totalSavedTime: 0,
                      equivalentValue: 0,
                      totalSavedTimeDisplay: '0.0',
                      equivalentValueDisplay: '0',
                      totalDecisions: 0,
                      recentDecisions: 0
                    }
                  });
                  
                  wx.showToast({
                    title: '重置成功',
                    icon: 'success',
                    duration: 2000
                  });
                  
                  // 延迟后重新加载数据
                  setTimeout(() => {
                    this.loadUserData();
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
      content: '如有问题或建议，请发送邮件至：\n\niancoding@163.com\n\n我们会认真处理您的反馈！',
      showCancel: false
    });
  },

  // 关于小程序
  aboutApp: function() {
    wx.showModal({
      title: '关于时间赎回器',
      content: `版本：${this.data.version}\n\n基于《买回你的时间》一书理念开发\n\n帮助你计算时间价值，做出明智决策\n\n"金钱仅仅是用来购买时间的工具"\n\n让每一分钟都更有价值！`,
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