// 微信云开发云函数 - 登录处理
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  try {
    const { code } = event
    
    if (!code) {
      return {
        success: false,
        message: '缺少登录凭证'
      }
    }
    
    // 获取用户openid
    const openid = wxContext.OPENID
    const unionid = wxContext.UNIONID
    
    console.log('用户登录成功:', { openid, unionid })
    
    // 这里可以根据openid查询数据库获取用户信息
    // 或者返回默认用户信息
    const userInfo = {
      nickName: '微信用户',
      avatarUrl: ''
    }
    
    // 返回成功响应
    return {
      success: true,
      openid: openid,
      unionid: unionid,
      userInfo: userInfo,
      message: '登录成功'
    }
    
  } catch (error) {
    console.error('登录处理错误:', error)
    return {
      success: false,
      message: '服务器错误'
    }
  }
} 