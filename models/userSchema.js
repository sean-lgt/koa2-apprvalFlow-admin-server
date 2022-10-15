/*
 * 用户模型 
 */
const mongooes = require('mongoose')

const userSchema = mongooes.Schema({
  "userId": Number, //用户ID，自增长
  "userName": String, //用户名称
  "userPwd": String, //用户密码，md5加密
  "userEmail": String, //用户邮箱
  "mobile": String, //手机号
  "sex": Number, //性别 0男 1女
  "deptId": [], //部门
  "job": String, //岗位
  "state": {
    type: Number,
    default: 1
  }, // 状态 1在职 2离职 3试用期
  "role": {
    type: Number,
    default: 1
  }, //用户角色 0系统管理员 1普通用户
  "roleList": [], //角色列表
  "ceateTime": {
    type: Date,
    default: Date.now()
  }, // 创建时间
  "lastLoginTime": {
    type: Date,
    default: Date.now()
  }, // 最后登录时间
  remark: String, //表备注
})

module.exports = mongooes.model('users', userSchema, 'users')