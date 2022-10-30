/*
 * 休假申请管理模块
 */
const router = require('koa-router')()
const Leave = require('../models/leaveSchema')
const Dept = require('../models/deptSchema')
const util = require('../utils/util')

// 设置路由公共前缀
router.prefix('/api/leave')


// 休假申请相关操作
router.post('/operate', async (ctx, next) => {
  const { _id, action, ...params } = ctx.request.body
  const authorization = ctx.request.headers.authorization
  const { data } = util.tokenDecodeed(authorization)
  if (action == 'add') {
    // 创建休假申请操作
    let orderNo = 'XJ'
    orderNo += util.formateDate(new Date(), 'yyyyMMdd')
    const total = await Leave.countDocuments() // 获取总数
    params.orderNo = orderNo + total //生成订单号

    // 获取用户当前部门ID
    const _id = data.deptId.pop()
    // 查找负责人信息
    const dept = await Dept.findById(_id)
    // 获取人事部门和财务部门负责人信息
    const userList = await Dept.find({ deptName: { $in: ['人事部门', '财务部门'] } })
    //负责审核人
    const auditUsers = dept.userName
    // 审核流
    const auditFlows = [
      { userId: dept.userId, userName: dept.userName, userEmail: dept.userEmail }
    ]
    userList.map(item => {
      auditFlows.push({
        userId: item.userId,
        userName: item.userName,
        userEmail: item.userEmail
      })
      auditUsers += ',' + item.userName
    })

    params.auditUsers = auditUsers;
    params.curAuditUserName = dept.userName;
    params.auditFlows = auditFlows;
    params.auditLogs = []
    params.applyUser = {
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail
    }

    let res = await Leave.create(params)
    ctx.body = util.success("", "创建成功")

  } else {
    // 作废
    let res = await Leave.findByIdAndUpdate(_id, { applyState: 5 })
    ctx.body = util.success('', "操作成功")
  }

})

// 休假申请列表
router.get('/list', async (ctx, next) => {
  const { applyState } = ctx.request.query
  const { page, skipIndex } = util.pager(ctx.request.query)
  const authorization = ctx.request.headers.authorization
  const { data } = util.tokenDecodeed(authorization)
  try {
    let params = {}
    params = {
      'applyUser.userId': data.userId
    }
    if (applyState) params.applyState = applyState
    const query = Leave.find(params)
    const list = await query.skip(skipIndex).limit(page.pageSize)
    const total = await Leave.countDocuments()
    ctx.body = util.success({
      page: {
        ...page,
        total
      },
      list
    })
  } catch (error) {
    ctx.body = util.fail(`查询失败:${error.stack}`)
  }
})



module.exports = router