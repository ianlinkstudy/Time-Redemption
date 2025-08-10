// 微信小程序后端服务器示例
// 用于处理微信登录和获取用户信息

const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// 中间件
app.use(express.json());

// 微信小程序配置
const APPID = 'your-appid'; // 替换为您的微信小程序AppID
const SECRET = 'your-secret'; // 替换为您的微信小程序AppSecret

// 微信登录接口
app.post('/api/login', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.json({
        success: false,
        message: '缺少登录凭证'
      });
    }
    
    // 调用微信接口获取openid和session_key
    const response = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: APPID,
        secret: SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });
    
    const { openid, session_key, unionid, errcode, errmsg } = response.data;
    
    if (errcode) {
      console.error('微信接口错误:', errmsg);
      return res.json({
        success: false,
        message: '微信登录失败: ' + errmsg
      });
    }
    
    if (!openid) {
      return res.json({
        success: false,
        message: '获取用户标识失败'
      });
    }
    
    console.log('用户登录成功:', { openid, unionid });
    
    // 这里可以根据openid查询数据库获取用户信息
    // 或者返回默认用户信息
    const userInfo = {
      nickName: '微信用户',
      avatarUrl: ''
    };
    
    // 返回成功响应
    res.json({
      success: true,
      openid: openid,
      unionid: unionid,
      userInfo: userInfo,
      message: '登录成功'
    });
    
  } catch (error) {
    console.error('登录处理错误:', error);
    res.json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取用户信息接口（可选）
app.get('/api/user/:openid', async (req, res) => {
  try {
    const { openid } = req.params;
    
    // 这里应该从数据库查询用户信息
    // 示例返回模拟数据
    const userInfo = {
      nickName: '微信用户',
      avatarUrl: '',
      openid: openid
    };
    
    res.json({
      success: true,
      userInfo: userInfo
    });
    
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.json({
      success: false,
      message: '获取用户信息失败'
    });
  }
});

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '服务器运行正常',
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`微信小程序后端服务器运行在 http://localhost:${port}`);
  console.log('请确保：');
  console.log('1. 已安装依赖: npm install express axios');
  console.log('2. 已配置正确的APPID和SECRET');
  console.log('3. 已在微信开发者工具中配置服务器域名');
});

// 使用说明：
// 1. 安装依赖：npm install express axios
// 2. 替换APPID和SECRET为您的微信小程序配置
// 3. 在微信开发者工具中配置服务器域名
// 4. 在小程序代码中更新serverUrl为您的服务器地址
// 5. 运行服务器：node server-example.js 