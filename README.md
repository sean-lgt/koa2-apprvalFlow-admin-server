# 基本 koa2 的后台管理系统服务端模板

## 项目结构目录
- 使用 tree-node-cli  `npm install -g tree-node-cli`
- 需要在 git bash 使用：`tree -L 3 -I "node_modules" > tree.txt`
- **不用在 cmd 上使用，会有错误**

```
├── app.js             # 项目入口文件
├── bin                # 项目执行目录
│   └── www
├── config             # 项目配置文件
│   ├── db.js
│   └── index.js
├── logs               # 项目日志文件
│   ├── all-logs.log
├── models               # 数据模型
│   ├── counterSchema.js
│   ├── deptSchema.js
│   ├── leaveSchema.js
│   ├── menuSchema.js
│   ├── roleSchema.js
│   └── userSchema.js
├── package-lock.json
├── package.json
├── public                # 公共文件
│   ├── images
│   ├── javascripts
│   └── stylesheets
│       └── style.css
├── routes             # 路由
│   ├── depts.js
│   ├── index.js
│   ├── leaves.js
│   ├── menus.js
│   ├── roles.js
│   └── users.js
├── utils              # 工具函数
│   ├── log4j.js
│   └── util.js
└── views              # 静态视图
    ├── error.pug
    ├── index.pug
    └── layout.pug
```
