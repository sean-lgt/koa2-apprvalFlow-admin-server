/*
 * 角色管理模块
 */
const router = require('koa-router')()
const Role = require('../models/roleSchema')
const util = require('../utils/util')

// 设置路由公共前缀
router.prefix('/api/roles')


// 获取所有角色
router.get('/allList', async (ctx, next) => {
  try {
    // 只需要 id roleName
    const list = await Role.find({}, "_id roleName")
    ctx.body = util.success(list)
  } catch (error) {
    ctx.body = util.fail(`查询失败：${error.stack}`)
  }
})

// 按页获取角色列表
router.get('/list', async (ctx, next) => {
  const { roleName } = ctx.request.query
  const { page, skipIndex } = util.pager(ctx.request.query)
  try {
    let params = {}
    if (roleName) params.roleName = roleName
    const query = Role.find(params)
    const list = await query.skip(skipIndex).limit(page.pageSize)
    const total = await Role.countDocuments(params)
    ctx.body = util.success({
      list,
      page: {
        ...page,
        total
      }
    })
  } catch (error) {
    ctx.body = util.fail(`查询失败:${error.stack}`)
  }
})

// 角色操作：创建、编辑和删除
router.post('/operate', async (ctx, next) => {
  const { _id, roleName, remark, action } = ctx.request.body
  let res = []
  let info = ''
  try {
    if (action == 'add') {
      // 新增
      res = await Role.create({ roleName, remark })
      info = '创建成功'
    } else if (action == 'edit') {
      // 修改
      if (!_id) {
        ctx.body = util.fail("缺少参数：_id")
        return
      } else {
        let params = { roleName, remark }
        params.updateTime = Date.now()
        res = await Role.findByIdAndUpdate(_id, params, { new: true })
        info = '编辑成功'
      }
    } else {
      // 删除
      if (!_id) {
        ctx.body = util.fail("缺少参数：_id")
        return
      } else {
        res = await Role.findByIdAndRemove(_id)
        info = '删除成功'
      }
    }
    ctx.body = util.success(res, info)
  } catch (error) {
    ctx.body = util.fail(`操作失败，${error.stack}`)
  }

})



module.exports = router