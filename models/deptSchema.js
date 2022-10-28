/*
 * 部门模型 
 */
const mongooes = require('mongoose')

const deptSchema = mongooes.Schema({
  deptName: String,
  userId: String,
  userName: String,
  userEmail: String,
  parentId: [mongooes.Types.ObjectId],
  updateTime: {
    type: Date,
    default: Date.now()
  },
  createTime: {
    type: Date,
    default: Date.now()
  },
})


module.exports = mongooes.model('depts', deptSchema, 'depts')