/*
 * 菜单管理模块
 */
const router = require('koa-router')()
const Menu = require('../models/menuSchema')
const util = require('../utils/util')

// 设置路由公共前缀
router.prefix('/api/menu')

// 菜单新增、编辑、删除功能
router.post('/operate', async (ctx, next) => {
  const { _id, action, ...params } = ctx.request.body // 获取参数
  let result = null
  let info = ''
  try {
    if (action === 'add') {
      result = await Menu.create(params)
      info = '创建成功'
    } else if (action === 'edit') {
      params.updateTime = new Date()
      result = await Menu.findByIdAndUpdate(_id, params)
      info = '编辑成功'
    } else {
      result = await Menu.findOneAndRemove(_id)
      await Menu.deleteMany({ parentId: { $all: [_id] } })
      info = '删除成功'
    }
    ctx.body = util.success('', info)
  } catch (error) {
    ctx.body = util.fail(error.stack)
  }
})


module.exports = router