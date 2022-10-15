/*
 * 用户管理模块
 */
const router = require('koa-router')()
const User = require('../models/userSchema')
const util = require('../utils/util')
router.prefix('/api/users')

// 登录
router.post('/login', async (ctx) => {
  console.log("SDFASF")
  try {
    // 获取post传递的数据
    const { userName, userPwd } = ctx.request.body
    const res = await User.findOne({
      userName,
      userPwd
    })
    if (res) {
      ctx.body = util.success(res)
    } else {
      ctx.body = util.fail('账号密码不正确')
    }
  } catch (error) {
    ctx.body = util.fail(error.msg || '系统异常')
  }

})


module.exports = router