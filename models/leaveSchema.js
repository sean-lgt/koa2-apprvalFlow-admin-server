/*
 * 休假申请模型 
 */
const mongooes = require('mongoose')

const leaveSchema = mongooes.Schema({
  orderNo: String,
  applyType: Number,
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, default: Date.now },
  applyUser: {
    userId: String,
    userName: String,
    userEmail: String
  },
  leaveTime: String,
  reasons: String,
  auditUsers: String,
  curAuditUserName: String,
  auditFlows: [{
    userId: String,
    userName: String,
    userEmail: String
  }],
  auditLogs: [{
    userId: String,
    userName: String,
    createTime: Date,
    remark: String,
    action: String
  }],
  applyState: { type: Number, default: 1 },
  createTime: { type: Date, default: Date.now }
})


module.exports = mongooes.model('leaves', leaveSchema, 'leaves')