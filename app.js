const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
// const logger = require('koa-logger')   // 官方提供的 logger 插件，比较简单
// const log4js = require('log4js') // log4js 插件
const log4js = require('./utils/log4j') //自定义封装的log工具
const index = require('./routes/index')
const users = require('./routes/users')

// 加载 mongoDB
require('./config/db')

// 初始化 log4js 
// const log = log4js.getLogger();


// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(json())
// app.use(logger())   //官方提供的 logger 是相对比较简单的
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  // const start = new Date()
  // 查看请求参数
  log4js.info(`url:${JSON.stringify(ctx.request.url)}`)
  log4js.info(`query:${JSON.stringify(ctx.request.query)}`)
  log4js.info(`params:${JSON.stringify(ctx.request.body)}`)
  await next()
  // 使用封装好的log工具函数打印
  // log4js.info('测试打印日志')
  // log4js.error('此处发生错误，打印日志')
  // 使用log4js 打印日志
  // log.level = "debug";
  // log.debug("Some debug messages");
  // 原框架提供的打印log
  // const ms = new Date() - start
  // console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
// app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app