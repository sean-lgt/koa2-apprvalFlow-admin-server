/**
 * 通过工具函数
 */

const jwt = require('koa-jwt')
const jsonwebtoken = require('jsonwebtoken')
const log4js = require('./log4j')

const CODE = {
  SUCCESS: 200,
  PARAM_ERROR: 10001, //参数错误
  USER_ACCOUNT_ERROR: 20001, //账号或密码错误
  USER_LOGIN_ERROR: 3001, //用户未登录
  BUSINESS_ERROR: 40001, //业务请求失败
  AUTH_ERROR: 50001, //认证失败或者TOKEN过期
}

module.exports = {
  /**
   * @description: 分页结构封装
   * @return {*}
   * @param {number} pageNum 页码
   * @param {number} pageSize 页数
   */
  pager({ pageNum = 1, pageSize = 10 }) {
    pageNum *= 1
    pageSize *= 1
    const skipIndex = (pageNum - 1) * pageSize
    return {
      page: {
        pageNum,
        pageSize
      },
      skipIndex
    }
  },
  /**
   * @description: 成功返回信息
   * @return {*}
   * @param {*} data 数据
   * @param {*} msg 信息提示
   * @param {*} code 状态码
   */
  success(data = '', msg = '', code = CODE.SUCCESS) {
    log4js.debug(data)
    return {
      code,
      data,
      msg
    }
  },
  /**
   * @description: 错误返回信息
   * @return {*}
   * @param {*} msg 错误信息
   * @param {*} code 状态码
   * @param {*} data 数据
   */
  fail(msg = '', code = CODE.BUSINESS_ERROR, data = '') {
    log4js.debug(msg)
    return {
      code,
      data,
      msg
    }
  },
  CODE,
  /**
   * @description: 解密token
   * @return {*} 返回token解密后的信息
   * @param {*} authorization token
   */
  tokenDecodeed(authorization) {
    if (authorization) {
      let token = authorization.split(' ')[1]
      return jsonwebtoken.verify(token, 'jwt@twj')
    }
    return ''
  },
  /**
   * @description: 递归拼接树形菜单列表
   * @return {*}
   * @param {*} rootList 根列表
   * @param {*} id 标识
   * @param {*} list 组装后的列表
   */
  getTreeMenu(rootList, id, list) {
    for (let i = 0; i < rootList.length; i++) {
      let item = rootList[i]
      if (String(item.parentId.slice().pop()) == String(id)) {
        list.push(item._doc)
      }
    }
    list.map(item => {
      item.children = []
      this.getTreeMenu(rootList, item._id, item.children)
      if (item.children.length == 0) {
        delete item.children
      } else if (item.children.length > 0 && item.children[0].menuType == 2) {
        // 快速区分按钮和菜单，用于后期做菜单按钮权限控制
        item.action = item.children
      }
    })
    return list
  },
  // 格式化日期时间
  formateDate(date, rule) {
    let fmt = rule || 'yyyy-MM-dd hh:mm:ss'
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, date.getFullYear())
    }
    const o = {
      // 'y+': date.getFullYear(),
      'M+': date.getMonth() + 1,
      'd+': date.getDate(),
      'h+': date.getHours(),
      'm+': date.getMinutes(),
      's+': date.getSeconds()
    }
    for (let k in o) {
      if (new RegExp(`(${k})`).test(fmt)) {
        const val = o[k] + '';
        fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? val : ('00' + val).substr(val.length));
      }
    }
    return fmt;
  },
}