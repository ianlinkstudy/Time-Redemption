// pages/decision/history.js
Page({
  data: {
    historyList: []
  },

  onLoad: function() {
    this.loadHistory();
  },

  onShow: function() {
    this.loadHistory();
  },

  // 加载历史记录
  loadHistory: function() {
    try {
      const history = wx.getStorageSync('decisionHistory') || [];
      this.setData({
        historyList: history
      });
    } catch (error) {
      console.error('加载历史记录失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 查看历史详情
  viewHistoryDetail: function(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.historyList[index];
    
    const detailInfo = `任务：${item.taskDescription}\n` +
                      `类型：${item.taskType}\n` +
                      `预估时间：${item.estimatedHours}小时\n` +
                      `外包价格：¥${item.outsourcePrice}\n` +
                      `时间价值：¥${item.userTimeValue}/小时\n` +
                      `决策结果：${item.analysis.recommendation}\n` +
                      `原因：${item.analysis.reason}`;
    
    wx.showModal({
      title: '决策详情',
      content: detailInfo,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 删除历史记录
  deleteHistory: function(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.historyList[index];
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除这条决策记录吗？`,
      success: (res) => {
        if (res.confirm) {
          this.removeHistoryItem(index);
        }
      }
    });
  },

  // 移除历史记录项
  removeHistoryItem: function(index) {
    try {
      const history = this.data.historyList;
      history.splice(index, 1);
      
      wx.setStorageSync('decisionHistory', history);
      this.setData({
        historyList: history
      });
      
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('删除失败:', error);
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      });
    }
  },

  // 清空所有历史
  clearAllHistory: function() {
    if (this.data.historyList.length === 0) {
      wx.showToast({
        title: '暂无记录',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有历史记录吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.removeStorageSync('decisionHistory');
            this.setData({
              historyList: []
            });
            wx.showToast({
              title: '清空成功',
              icon: 'success'
            });
          } catch (error) {
            console.error('清空失败:', error);
            wx.showToast({
              title: '清空失败',
              icon: 'none'
            });
          }
        }
      }
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

  // 前往决策页面
  goToDecision: function() {
    wx.navigateBack();
  },

  // 返回按钮
  goBack: function() {
    wx.navigateBack();
  }
}); 