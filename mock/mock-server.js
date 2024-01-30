// 引入必要的 Node.js 模块
const chokidar = require('chokidar') // 用于监听文件系统的变化
const bodyParser = require('body-parser') // 用于解析请求体
const chalk = require('chalk') // 用于在控制台输出彩色文本
const path = require('path') // 用于处理文件路径
const Mock = require('mockjs') // 引入 Mock.js 库

const mockDir = path.join(process.cwd(), 'mock') // 设置 mock 文件夹的路径

// 注册路由函数
function registerRoutes(app) {
  let mockLastIndex
  const { mocks } = require('./index.js') // 引入定义的 mock 路由
  const mocksForServer = mocks.map(route => {
    return responseFake(route.url, route.type, route.response) // 将每个 mock 路由转换为可用的格式
  })
  for (const mock of mocksForServer) {
    app[mock.type](mock.url, mock.response) // 将 mock 路由注册到 app 上
    mockLastIndex = app._router.stack.length
  }
  const mockRoutesLength = Object.keys(mocksForServer).length
  return {
    mockRoutesLength: mockRoutesLength,
    mockStartIndex: mockLastIndex - mockRoutesLength
  }
}

// 注销路由函数
function unregisterRoutes() {
  Object.keys(require.cache).forEach(i => {
    if (i.includes(mockDir)) {
      delete require.cache[require.resolve(i)] // 清除缓存的 mock 文件，以便重新加载
    }
  })
}

// 创建假的响应数据
const responseFake = (url, type, respond) => {
  return {
    url: new RegExp(`${process.env.VUE_APP_BASE_API}${url}`), // 生成匹配 URL 的正则表达式
    type: type || 'get', // 设置请求类型，默认为 'get'
    response(req, res) {
      console.log('request invoke:' + req.path) // 在控制台记录请求路径
      res.json(Mock.mock(respond instanceof Function ? respond(req, res) : respond)) // 返回 mock 数据
    }
  }
}

// 导出一个函数，用于配置 mock 服务器
module.exports = app => {
  // 使用 bodyParser 中间件解析请求体
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({
    extended: true
  }))

  const mockRoutes = registerRoutes(app) // 注册 mock 路由
  var mockRoutesLength = mockRoutes.mockRoutesLength
  var mockStartIndex = mockRoutes.mockStartIndex

  // 使用 chokidar 监听 mock 目录的文件变化
  chokidar.watch(mockDir, {
    ignored: /mock-server/,
    ignoreInitial: true
  }).on('all', (event, path) => {
    if (event === 'change' || event === 'add') {
      try {
        // 当文件改变时，先移除之前注册的 mock 路由
        app._router.stack.splice(mockStartIndex, mockRoutesLength)

        // 清除缓存的 mock 路由
        unregisterRoutes()

        // 重新注册 mock 路由
        const mockRoutes = registerRoutes(app)
        mockRoutesLength = mockRoutes.mockRoutesLength
        mockStartIndex = mockRoutes.mockStartIndex

        // 输出重载成功的信息
        console.log(chalk.magentaBright(`\n > Mock Server hot reload success! changed  ${path}`))
      } catch (error) {
        console.log(chalk.redBright(error)) // 输出错误信息
      }
    }
  })
}
