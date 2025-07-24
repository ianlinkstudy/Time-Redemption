// pages/calculator/calculator.js
Page({
  data: {
    // 输入数据
    salaryType: 'annual', // 'annual' 或 'monthly'
    annualSalary: '',
    monthlySalary: '',
    otherIncome: '',
    
    // 计算结果
    totalAnnualIncome: 0,
    timeValue: 0,
    timeValueQuarter: 0, // 添加1/4时间价值
    hiringSuggestionMin: 0,
    hiringSuggestionMax: 0,
    
    // 界面状态
    isEditing: false,
    showResult: false
  },

  onLoad: function () {
    // 加载已保存的数据
    this.loadSavedData();
    
    console.log('计算器页面加载完成');
  },

  // 加载已保存的数据
  loadSavedData: function() {
    try {
      const savedData = wx.getStorageSync('timeCalculatorData');
      if (savedData) {
        this.setData({
          annualSalary: savedData.annualSalary || '',
          monthlySalary: savedData.monthlySalary || '',
          otherIncome: savedData.otherIncome || '',
          salaryType: savedData.salaryType || 'annual',
          timeValue: savedData.timeValue || 0,
          hiringSuggestionMin: savedData.hiringSuggestionMin || 0,
          hiringSuggestionMax: savedData.hiringSuggestionMax || 0,
          showResult: savedData.showResult || false
        });
        // 计算年总收入
        this.calculateTotalIncome();
        
        // 如果有保存的计算结果，显示结果状态；否则进入编辑模式
        if (savedData.timeValue > 0) {
          this.setData({
            showResult: true,
            isEditing: false
          });
        } else {
          this.setData({
            showResult: false,
            isEditing: true
          });
        }
      } else {
        // 首次使用，进入编辑模式
        this.setData({
          isEditing: true,
          showResult: false
        });
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      // 出错时也进入编辑模式
      this.setData({
        isEditing: true,
        showResult: false
      });
    }
  },

  // 保存数据
  saveData: function() {
    try {
      const data = {
        annualSalary: this.data.annualSalary,
        monthlySalary: this.data.monthlySalary,
        otherIncome: this.data.otherIncome,
        salaryType: this.data.salaryType,
        timeValue: this.data.timeValue,
        hiringSuggestionMin: this.data.hiringSuggestionMin,
        hiringSuggestionMax: this.data.hiringSuggestionMax,
        showResult: this.data.showResult,
        totalAnnualIncome: this.data.totalAnnualIncome,
        updateTime: new Date().toISOString()
      };
      
      console.log('=== 计算器保存数据 ===');
      console.log('准备保存的数据:', data);
      console.log('timeValue类型:', typeof data.timeValue);
      console.log('timeValue值:', data.timeValue);
      
      wx.setStorageSync('timeCalculatorData', data);
      
      // 立即验证保存结果
      const savedData = wx.getStorageSync('timeCalculatorData');
      console.log('保存后验证读取:', savedData);
      console.log('验证timeValue:', savedData.timeValue);
      console.log('验证成功:', savedData.timeValue === data.timeValue);
      
      // 同时保存到用户信息中（虽然首页不使用这个，但保持一致性）
      const userInfo = wx.getStorageSync('userInfo') || {};
      userInfo.timeValue = this.data.timeValue;
      userInfo.hiringSuggestionMin = this.data.hiringSuggestionMin;
      userInfo.hiringSuggestionMax = this.data.hiringSuggestionMax;
      userInfo.hasSetTimeValue = this.data.timeValue > 0;
      wx.setStorageSync('userInfo', userInfo);
      
      console.log('保存用户信息:', userInfo);
      
      // 设置数据更新时间戳，用于其他页面检测更新
      wx.setStorageSync('lastDataUpdate', Date.now());
      
      console.log('=== 数据保存完成，已设置更新时间戳 ===');
    } catch (error) {
      console.error('保存数据失败:', error);
    }
  },

  // 薪资类型切换
  onSalaryTypeChange: function(e) {
    const salaryTypeMap = ['annual', 'monthly'];
    this.setData({
      salaryType: salaryTypeMap[e.detail.value]
    });
    this.calculateTotalIncome();
    this.calculateTimeValue();
  },

  // 年薪输入
  onAnnualSalaryInput: function(e) {
    this.setData({
      annualSalary: e.detail.value
    });
    this.calculateTotalIncome();
    this.calculateTimeValue();
  },

  // 月薪输入
  onMonthlySalaryInput: function(e) {
    this.setData({
      monthlySalary: e.detail.value
    });
    this.calculateTotalIncome();
    this.calculateTimeValue();
  },

  // 其他收入输入
  onOtherIncomeInput: function(e) {
    this.setData({
      otherIncome: e.detail.value
    });
    this.calculateTotalIncome();
    this.calculateTimeValue();
  },



  // 计算时间价值
  calculateTimeValue: function() {
    let totalIncome = 0;
    
    // 计算年收入
    if (this.data.salaryType === 'annual' && this.data.annualSalary) {
      totalIncome += parseFloat(this.data.annualSalary);
    } else if (this.data.salaryType === 'monthly' && this.data.monthlySalary) {
      totalIncome += parseFloat(this.data.monthlySalary) * 12;
    }
    
    // 添加其他收入
    if (this.data.otherIncome) {
      totalIncome += parseFloat(this.data.otherIncome);
    }
    
    // 计算时间价值 (年收入 ÷ 2000)
    const timeValue = totalIncome / 2000;
    
    // 计算1/4时间价值
    const timeValueQuarter = Math.round(timeValue * 0.25);
    
    // 计算建议雇佣单价范围
    const hiringSuggestionMin = Math.round(timeValue * 0.25); // 1.0x精力系数
    const hiringSuggestionMax = Math.round(timeValue * 0.5);  // 2.0x精力系数
    
    this.setData({
      totalAnnualIncome: totalIncome,
      timeValue: Math.round(timeValue),
      timeValueQuarter: timeValueQuarter,
      hiringSuggestionMin: hiringSuggestionMin,
      hiringSuggestionMax: hiringSuggestionMax,
      showResult: true
    });
    
    console.log('计算完成:', {
      totalIncome: totalIncome,
      timeValue: timeValue,
      timeValueQuarter: timeValueQuarter,
      hiringSuggestionMin: hiringSuggestionMin,
      hiringSuggestionMax: hiringSuggestionMax
    });
    
    // 自动保存数据
    if (timeValue > 0) {
      this.saveData();
    }
  },

  // 重置数据
  resetData: function() {
    wx.showModal({
      title: '确认重置',
      content: '确定要重置所有数据吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            annualSalary: '',
            monthlySalary: '',
            otherIncome: '',
            salaryType: 'annual',
            timeValue: 0,
            hiringSuggestionMin: 0,
            hiringSuggestionMax: 0,
            showResult: false
          });
          wx.removeStorageSync('timeCalculatorData');
          wx.showToast({
            title: '重置成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 显示计算说明
  showExplanation: function() {
    wx.showModal({
      title: '计算说明',
      content: '时间价值 = (年收入 + 其他收入) ÷ 2000\n\n其中2000 = 250个工作日 × 8小时\n\n这个公式基于标准工作时间计算你的每小时时间价值，帮助你做出明智的时间赎回决策。',
      confirmText: '知道了',
      showCancel: false
    });
  },

  // 计算年总收入
  calculateTotalIncome: function() {
    const { salaryType, annualSalary, monthlySalary, otherIncome } = this.data;
    let totalIncome = 0;
    
    if (salaryType === 'annual') {
      totalIncome = (parseFloat(annualSalary) || 0) + (parseFloat(otherIncome) || 0);
    } else {
      totalIncome = ((parseFloat(monthlySalary) || 0) * 12) + (parseFloat(otherIncome) || 0);
    }
    
    this.setData({
      totalAnnualIncome: totalIncome
    });
    
    return totalIncome;
  },

  // 进入编辑模式
  startEdit: function() {
    this.setData({
      isEditing: true
    });
  },

  // 保存并退出编辑模式
  saveAndExit: function() {
    console.log('=== 开始保存并退出 ===');
    
    // 先计算年总收入
    const totalIncome = this.calculateTotalIncome();
    console.log('计算的年总收入:', totalIncome);
    
    if (totalIncome > 0) {
      // 进行时间价值计算
      this.calculateTimeValue();
      
      // 使用setTimeout确保计算完成后再保存和退出编辑模式
      setTimeout(() => {
        console.log('计算完成，当前时间价值:', this.data.timeValue);
        
        if (this.data.timeValue > 0) {
          // 保存数据到存储
          this.saveData();
          
          // 退出编辑模式
          this.setData({
            isEditing: false
          });
          
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          });
          
          console.log('=== 保存并退出完成 ===');
        } else {
          wx.showToast({
            title: '计算时间价值失败，请重试',
            icon: 'none'
          });
        }
      }, 200);
    } else {
      wx.showToast({
        title: '请填写有效的收入信息',
        icon: 'none'
      });
    }
  },

  // 取消编辑
  cancelEdit: function() {
    // 如果之前有保存的数据，恢复到显示模式
    if (this.data.timeValue > 0) {
      this.setData({
        isEditing: false
      });
    } else {
      // 如果没有保存的数据，提示用户
      wx.showModal({
        title: '提示',
        content: '您还没有保存任何数据，确定要取消吗？',
        success: (res) => {
          if (res.confirm) {
            // 清空输入，保持编辑模式
            this.setData({
              annualSalary: '',
              monthlySalary: '',
              otherIncome: ''
            });
          }
        }
      });
    }
  },


});