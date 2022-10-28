/*
 * 用户管理模块
 */
const router = require('koa-router')()
const jwt = require('jsonwebtoken') //生成jwt
const md5 = require('md5') //md5加密
const User = require('../models/userSchema')
const Counter = require('../models/counterSchema')
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
  // 解密token
  let authorization = ctx.request.headers.authorization
  const loginUserInfo = util.tokenDecodeed(authorization)
  console.log('🚀【登录信息】', loginUserInfo);
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

// 用户新增与编辑
router.post('/operate', async (ctx, next) => {
  // 获取post请求相关参数
  const { userId, userName, userEmail, mobile, job, state, roleList, deptId, action } = ctx.request.body
  if (action === 'add') {
    // 新增用户操作
    if (!userName || !userEmail || !deptId) {
      // 未传必填项
      ctx.body = util.fail('参数错误', util.CODE.PARAM_ERROR)
      return
    }
    const res = await User.findOne({ $or: [{ userName }, { userEmail }] }, '_id userName userEmail')
    if (res) {
      ctx.body = util.fail(`系统监测到有重复的用户，信息如下：${res.userName} -- ${res.userEmail}`)
    } else {
      // 符合条件新增
      const doc = await Counter.findOneAndUpdate({ _uid: 'userId' }, { $inc: { sequence_value: 1 } }, { new: true })
      try {
        const user = new User({
          userId: doc.sequence_value,
          userName,
          userPwd: md5('123456'),
          userEmail,
          role: 1, //默认普通用户
          roleList,
          job,
          state,
          deptId,
          mobile
        })
        user.save()
        ctx.body = util.success('', '用户创建成功')
      } catch (error) {
        ctx.body = util.fail(error.stack, '用户创建失败')
      }
    }
  } else {
    // 编辑操作
    if (!deptId) {
      ctx.body = util.fail('部门不能为空', util.CODE.PARAM_ERROR)
      return false
    }
    try {
      const res = await User.findOneAndUpdate({ userId }, { mobile, job, state, roleList, deptId, }, { new: true })
      ctx.body = util.success({}, '更新成功')
    } catch (error) {
      ctx.body = util.fail(error.stack, '更新失败')
    }
  }
})

// 用户删除和批量删除
router.post('/delete', async (ctx, next) => {
  const { userIds } = ctx.request.body

  // const res = await User.updateMany({ $or: [{{ userId: 100001 }, {userId:100002}] })
  const res = await User.updateMany({ userId: { $in: userIds } }, { state: 2 })

  if (res.modifiedCount) {
    ctx.body = util.success(res, `删除成功${res.modifiedCount}条`)
    return
  }
  ctx.body = util.fail('删除失败')
})


module.exports = router