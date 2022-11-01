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
    let auditUsers = ""
    // 审核流
    let auditFlows = []
    if (dept) {
      auditUsers = dept.userName
      auditFlows = [
        { userId: dept.userId, userName: dept.userName, userEmail: dept.userEmail }
      ]
    } else {
      auditUsers = data.userName
      auditFlows = [
        { userId: data.userId, userName: data.userName, userEmail: data.userEmail }
      ]
    }

    userList.map(item => {
      auditFlows.push({
        userId: item.userId,
        userName: item.userName,
        userEmail: item.userEmail
      })
      auditUsers += ',' + item.userName
    })

    params.auditUsers = auditUsers;
    params.curAuditUserName = auditUsers; //dept.userName
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
  const { applyState, type } = ctx.request.query
  const { page, skipIndex } = util.pager(ctx.request.query)
  const authorization = ctx.request.headers.authorization
  const { data } = util.tokenDecodeed(authorization)
  try {
    let params = {}
    if (type == 'approve') {
      if (applyState == 1 || applyState == 2) {
        // 状态
        params.curAuditUserName = data.userName
        params.$or = [{ applyState: 1 }, { applyState: 2 }]
      } else if (applyState > 2) {
        params = { "auditFlows.userId": data.userId, applyState }
      } else {
        params = { "auditFlows.userId": data.userId }
      }
    } else {
      params = {
        'applyUser.userId': data.userId
      }
      if (applyState) params.applyState = applyState
    }

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

// 休假申请审核操作
router.post('/approve', async (ctx, next) => {
  const { action, remark, _id } = ctx.request.body
  const authorization = ctx.request.headers.authorization
  const { data } = util.tokenDecodeed(authorization)
  let params = {}
  try {
    // 1:待审批 2:审批中 3:审批拒绝 4:审批通过 5:作废
    const doc = await Leave.findById(_id)
    const auditLogs = doc.auditLogs || []
    console.log('🚀【approve-action】', action)
    if (action == 'refuse') {
      params.applyState = 3
    } else {
      // 审核通过
      if (doc.auditFlows.length == doc.auditLogs.length) {
        ctx.body = util.success('当前申请单已处理，请勿重复提交')
        return
      } else if (doc.auditFlows.length == doc.auditLogs.length + 1) {
        params.applyState = 4
      } else if (doc.auditFlows.length > doc.auditLogs.length) {
        params.applyState = 2
        params.curAuditUserName = doc.auditFlows[doc.auditLogs.length + 1].userName
      }
    }
    auditLogs.push({
      userId: data.userId,
      userName: data.userName,
      createTime: new Date(),
      remark,
      action: action == 'refuse' ? "审核拒绝" : "审核通过"
    })
    params.auditLogs = auditLogs;
    let res = await Leave.findByIdAndUpdate(_id, params);
    ctx.body = util.success("", "处理成功");
  } catch (error) {
    ctx.body = util.fail(`查询异常：${error.message}`)
  }
})


// 获取通知数量
router.get('/count', async (ctx, next) => {
  const authorization = ctx.request.headers.authorization
  const { data } = util.tokenDecodeed(authorization)
  try {
    let params = {}
    params.curAuditUserName = data.userName
    params.$or = [{ applyState: 1 }, { applyState: 2 }]
    const total = await Leave.countDocuments(params)
    ctx.body = util.success(total)
  } catch (error) {
    ctx.body = util.fail(`查询异常：${error.message}`)
  }
})


module.exports = router