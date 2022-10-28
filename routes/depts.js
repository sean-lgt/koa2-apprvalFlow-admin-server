/*
 * 部门管理模块
 */
const router = require('koa-router')()
const Dept = require('../models/deptSchema')
const util = require('../utils/util')

// 设置路由公共前缀
router.prefix('/api/dept')


// 部门树形列表
router.get('/list', async (ctx, next) => {
  const { deptName } = ctx.request.query
  let params = {}
  if (deptName) params.deptName = deptName
  let rootList = await Dept.find(params)
  if (deptName) {
    ctx.body = util.success(rootList)
  } else {
    let treeList = getTreeDept(rootList, null, [])
    ctx.body = util.success(treeList)
  }
})

// 递归拼接树形列表
/**
 * @description: 递归拼接树形列表
 * @return {*}
 * @param {*} rootList
 * @param {*} id
 * @param {*} list
 */
const getTreeDept = (rootList, id, list) => {
  for (let i = 0; i < rootList.length; i++) {
    let item = rootList[i]
    if (String(item.parentId.slice().pop()) == String(id)) {
      list.push(item._doc)
    }
  }
  list.map(item => {
    item.children = []
    getTreeDept(rootList, item._id, item.children)
    if (item.children.length == 0) {
      delete item.children
    }
  })

  return list
}


// 部门操作：创建、编辑、删除
router.post('/operate', async (ctx, next) => {
  const { _id, action, ...params } = ctx.request.body
  let result = null
  let info = ''
  try {
    if (action == 'add') {
      // 创建操作
      result = await Dept.create(params)
      info = '创建成功'
    } else if (action == 'edit') {
      // 编辑操作
      if (!_id) {
        ctx.body = util.fail("缺少参数：_id")
        return
      }
      params.updateTime = new Date()
      result = await Dept.findByIdAndUpdate(_id, params, { new: true })
      info = '编辑成功'
    } else {
      // 删除操作，需要顺带删除子部门
      if (!_id) {
        ctx.body = util.fail("缺少参数：_id")
        return
      }
      result = await Dept.findByIdAndRemove(_id)
      await Dept.deleteMany({ parentId: { $all: [_id] } })
      info = '删除成功'
    }
    ctx.body = util.success(result, info)
  } catch (error) {
    ctx.body = util.fail(error.stack)
  }
})


module.exports = router