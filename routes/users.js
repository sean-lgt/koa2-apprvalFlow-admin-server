/*
 * 用户管理模块
 */
const router = require('koa-router')()
const jwt = require('jsonwebtoken') //生成jwt
const User = require('../models/userSchema')
const util = require('../utils/util')
router.prefix('/api/users')

// 登录
router.post('/login', async (ctx) => {
  try {
    // 获取post传递的数据
    const { userName, userPwd } = ctx.request.body
    const res = await User.findOne({
      userName,
      userPwd
    }, 'userId userName userEmail state role deptId roleList') // 提取某些字段返回  空格隔开
    const data = res._doc //集合数据
    const token = jwt.sign({
      data: data
    }, 'jwt@twj', { expiresIn: '2h' })
    if (res) {
      data.token = token
      ctx.body = util.success(data)
    } else {
      ctx.body = util.fail('账号密码不正确')
    }
  } catch (error) {
    ctx.body = util.fail(error.msg || '系统异常')
  }
})

// 用户列表
router.get('/list', async (ctx, next) => {
  const { userId, userName, state } = ctx.request.query
  const { page, skipIndex } = util.pager(ctx.request.query)
  let params = {}
  if (userId) params.userId = userId
  if (userName) params.userName = userName
  if (state && state != '0') params.state = state
  try {
    // 根据条件查询所有用户列表，并且过滤 _id，和 userPwd 用户密码
    const query = User.find(params, { _id: 0, userPwd: 0 })
    const list = await query.skip(skipIndex).limit(page.pageSize) // 截取数据
    const total = await User.countDocuments(params) //获取总条数
    ctx.body = util.success({
      page: {
        ...page,
        total
      },
      list
    })
  } catch (error) {
    ctx.body = util.fail(`查询异常：${error.stack}`)
  }
})



module.exports = router