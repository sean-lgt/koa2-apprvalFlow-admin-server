/*
 * 角色模型 
 */
const mongooes = require('mongoose')

const roleSchema = mongooes.Schema({
  roleName: String, //角色名称
  remark: String, //备注
  permissionList: {
    checkedKeys: [],
    halfCheckedKeys: []
  },
  updateTime: {
    type: Date,
    default: Date.now()
  },
  createTime: {
    type: Date,
    default: Date.now()
  }
})


module.exports = mongooes.model('roles', roleSchema, 'roles')