/**
 * 通过工具函数
 */

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
  CODE
}