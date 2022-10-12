/**
 * 日志存储 log
 * @author sean-lgt
 **/

const log4js = require('log4js')

const levels = {
  'trace': log4js.levels.TRACE,
  'debug': log4js.levels.DEBUG,
  'info': log4js.levels.INFO,
  'error': log4js.levels.ERROR,
  'fatal': log4js.levels.FATAL,
}

log4js.configure({
  appenders: {
    console: { type: 'console' },
    info: {
      type: 'file',
      filename: 'logs/all-logs.log'
    },
    error: {
      type: 'dateFile',
      filename: 'logs/log',
      pattern: 'yyyy-MM-dd.log',
      alwaysIncludePattern: true, //设置名称为 filename + pattern
    }
  },
  categories: {
    default: { appenders: ['console'], level: 'debug' },
    info: {
      appenders: ['info', 'console'],
      level: 'info'
    },
    error: {
      appenders: ['error', 'console'],
      level: 'error'
    }
  }
})

/**
 * @description: 日志输出，level 为 debug
 * @return {*}
 * @param {*} content 日志内容
 */
exports.debug = (content) => {
  const logger = log4js.getLogger()
  logger.level = levels.debug
  logger.debug(content)
}

/**
 * @description: 日志输出，level 为 info
 * @return {*}
 * @param {*} content 日志内容
 */
exports.info = (content) => {
  const logger = log4js.getLogger('info')
  log4js.levels = levels.info
  logger.info(content)
}

/**
 * @description: 日志输出，level 为 error
 * @return {*}
 * @param {*} content 日志内容
 */
exports.error = (content) => {
  const logger = log4js.getLogger('error')
  logger.level = levels.error
  logger.error(content)
}