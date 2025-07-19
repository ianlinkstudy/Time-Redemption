// pages/calculator/calculator.js
Page({
  data: {
    // 用户输入数据
    annualSalary: '', // 年薪
    monthlySalary: '', // 月薪
    otherIncome: '', // 其他收入
    salaryType: 'annual', // 薪资类型：annual/monthly
    
    // 计算结果
    timeValue: 0, // 你的时间价值
    hiringSuggestionMin: 0, // 建议雇佣单价最小值
    hiringSuggestionMax: 0, // 建议雇佣单价最大值
    
    // 界面状态
    showResult: false,
    isEditing: false, // 编辑模式标识
  },

  onLoad: function () {
    // 加载已保存的数据
    this.loadSavedData();
    
    // 测试计算功能
    console.log('计算器页面加载完成');
    console.log('当前数据:', this.data);
    
    // 延迟1秒后进行测试
    setTimeout(() => {
      this.testCalculation();
    }, 1000);
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
        updateTime: new Date().toISOString()
      };
      wx.setStorageSync('timeCalculatorData', data);
      
      console.log('保存数据:', data);
      
      // 同时保存到用户信息中
      const userInfo = wx.getStorageSync('userInfo') || {};
      userInfo.timeValue = this.data.timeValue;
      userInfo.hiringSuggestionMin = this.data.hiringSuggestionMin;
      userInfo.hiringSuggestionMax = this.data.hiringSuggestionMax;
      userInfo.hasSetTimeValue = this.data.timeValue > 0;
      wx.setStorageSync('userInfo', userInfo);
      
      console.log('保存用户信息:', userInfo);
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
    this.calculateTimeValue();
  },

  // 年薪输入
  onAnnualSalaryInput: function(e) {
    this.setData({
      annualSalary: e.detail.value
    });
    this.calculateTimeValue();
  },

  // 月薪输入
  onMonthlySalaryInput: function(e) {
    this.setData({
      monthlySalary: e.detail.value
    });
    this.calculateTimeValue();
  },

  // 其他收入输入
  onOtherIncomeInput: function(e) {
    this.setData({
      otherIncome: e.detail.value
    });
    this.calculateTimeValue();
  },



  // 计算时间价值
  calculateTimeValue: function() {
    const { annualSalary, monthlySalary, otherIncome, salaryType } = this.data;
    
    console.log('计算时间价值:', { annualSalary, monthlySalary, otherIncome, salaryType });
    
    // 获取年收入
    let yearlyIncome = 0;
    
    if (salaryType === 'annual') {
      const annualValue = parseFloat(annualSalary);
      if (!isNaN(annualValue) && annualValue > 0) {
        yearlyIncome = annualValue;
      }
    } else if (salaryType === 'monthly') {
      const monthlyValue = parseFloat(monthlySalary);
      if (!isNaN(monthlyValue) && monthlyValue > 0) {
        yearlyIncome = monthlyValue * 12;
      }
    }
    
    // 加上其他收入
    const otherValue = parseFloat(otherIncome);
    if (!isNaN(otherValue) && otherValue > 0) {
      yearlyIncome += otherValue;
    }
    
    console.log('年收入:', yearlyIncome);
    
    if (yearlyIncome > 0) {
      // 计算你的时间价值：年收入 ÷ 2000
      const timeValue = yearlyIncome / 2000;
      
      // 计算建议雇佣单价：时间价值 ÷ 4 (基础倍率)
      const hiringSuggestionMin = timeValue / 4 * 1;  // 1倍精力系数
      const hiringSuggestionMax = timeValue / 4 * 2;  // 2倍精力系数
      
      console.log('时间价值:', timeValue);
      console.log('建议雇佣单价范围:', hiringSuggestionMin, '-', hiringSuggestionMax);
      
      // 确保数值是有效的
      if (!isNaN(timeValue) && isFinite(timeValue) && timeValue > 0) {
        this.setData({
          timeValue: timeValue,
          hiringSuggestionMin: hiringSuggestionMin,
          hiringSuggestionMax: hiringSuggestionMax,
          showResult: true
        });
        
        console.log('设置数据完成:', { timeValue, hiringSuggestionMin, hiringSuggestionMax });
        
        // 保存数据
        this.saveData();
      } else {
        console.error('计算结果无效:', timeValue);
        this.setData({
          timeValue: 0,
          hiringSuggestionMin: 0,
          hiringSuggestionMax: 0,
          showResult: false
        });
      }
    } else {
      console.log('年收入为0，不显示结果');
      this.setData({
        timeValue: 0,
        hiringSuggestionMin: 0,
        hiringSuggestionMax: 0,
        showResult: false
      });
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

  // 查看详细说明
  showExplanation: function() {
    wx.showModal({
      title: '计算说明',
      content: '你的时间价值 = (年收入 + 其他收入) ÷ 2000\n\n建议雇佣单价 = 时间价值 ÷ 4 × (1~2倍精力系数)\n\n其中：\n• 2000 = 250个工作日 × 8小时\n• ÷ 4 是为了得到合理的雇佣价格\n• 精力系数根据任务复杂度调整',
      showCancel: false
    });
  },

  // 进入编辑模式
  startEdit: function() {
    this.setData({
      isEditing: true
    });
  },

  // 保存并退出编辑模式
  saveAndExit: function() {
    // 先进行计算
    this.calculateTimeValue();
    
    // 检查是否有有效的计算结果
    if (this.data.timeValue > 0) {
      // 保存数据
      this.saveData();
      
      // 退出编辑模式
      this.setData({
        isEditing: false,
        showResult: true
      });
      
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
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

  // 测试计算功能
  testCalculation: function() {
    console.log('开始测试计算功能...');
    
    // 设置测试数据
    this.setData({
      annualSalary: '120000',
      salaryType: 'annual',
      otherIncome: '0'
    });
    
    // 触发计算
    this.calculateTimeValue();
    
    console.log('测试完成，结果:', {
      timeValue: this.data.timeValue,
      hiringSuggestionMin: this.data.hiringSuggestionMin,
      hiringSuggestionMax: this.data.hiringSuggestionMax,
      showResult: this.data.showResult
    });
  }
});