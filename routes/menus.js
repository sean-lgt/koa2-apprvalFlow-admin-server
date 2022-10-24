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

// 菜单列表查询
router.get('/list', async (ctx, next) => {
  const { menuName, menuState } = ctx.request.query // 获取查询参数
  const params = {}
  if (menuName) params.menuName = menuName
  if (menuState) params.menuState = menuState
  let rootList = await Menu.find(params) || []
  const permissionList = getTreeMenu(rootList, null, []) //递归遍历生成数结构
  ctx.body = util.success(permissionList)
})

/**
 * @description: 递归拼接树形列表
 * @return {*}
 * @param {*} rootList 源数据
 * @param {*} id id标识
 * @param {*} list 新数据
 */
const getTreeMenu = (rootList, id, list) => {
  for (let i = 0; i < rootList.length; i++) {
    let item = rootList[i]
    if (String(item.parentId.slice().pop()) === String(id)) {
      list.push(item._doc) //一级菜单
    }
  }
  list.map(item => {
    item.children = []
    getTreeMenu(rootList, item._id, item.children) //递归遍历
    if (item.children.length == 0) {
      delete item.children
    } else if (item.children.length > 0 && item.children[0].menuType == 2) {
      // 快去区分按钮和菜单，用户后期做菜单按钮权限控制
      item.action = item.children
    }
  })
  return list
}


module.exports = router