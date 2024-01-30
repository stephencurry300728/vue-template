// 引入必要的 Node.js 模块
const chokidar = require('chokidar') // 用于监听文件系统的变化
const bodyParser = require('body-parser') // 用于解析请求体
const chalk = require('chalk') // 用于在控制台输出彩色文本
const path = require('path') // 用于处理文件路径
const Mock = require('mockjs') // // 引入 Mock 工具库，用于生成模拟数据

const mockDir = path.join(process.cwd(), 'mock') // 设置 mock 文件夹的路径

// registerRoutes 函数用于注册路由
function registerRoutes(app) {
  let mockLastIndex
  // 引入定义的 mock 路由
  const { mocks } = require('./index.js')

  // 将每个 mock 路由通过 responseFake 函数转换为可用的格式
  const mocksForServer = mocks.map(route => {
    return responseFake(route.url, route.type, route.response)
  })

  // 遍历转换后的 mock 路由数组
  for (const mock of mocksForServer) {
    // 根据 mock 路由的类型和 URL，使用对应的响应函数，将路由注册到 app 上
    app[mock.type](mock.url, mock.response)

    // 记录当前 app 的路由堆栈的长度
    // 这用于后续计算注册的 mock 路由数量
    mockLastIndex = app._router.stack.length
  }

  // 计算注册的 mock 路由数量
  const mockRoutesLength = Object.keys(mocksForServer).length

  // 返回 mock 路由的数量和在路由堆栈中的起始索引
  // mockStartIndex 用于标识第一个 mock 路由在 app 路由堆栈中的位置
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

// responseFake 函数用于创建一个假的响应对象
const responseFake = (url, type, respond) => {
  return {
    // 使用 RegExp 对象创建一个正则表达式，匹配特定的 URL。
    // process.env.VUE_APP_BASE_API 是从环境变量中获取的基础 API 路径。
    // 这个路径与传入的 url 参数结合，形成完整的请求 URL 匹配模式。
    url: new RegExp(`${process.env.VUE_APP_BASE_API}${url}`),

    // 设置请求的类型（如 'get', 'post' 等），如果没有指定，则默认为 'get'。
    type: type || 'get',

    // response 方法用于定义当匹配到上面的 URL 时如何响应。
    response(req, res) {
      // 当请求被触发时，打印请求的路径到控制台。这对于调试很有帮助。
      console.log('request invoke:' + req.path)

      // 使用 Mock.mock 方法生成模拟的响应数据。
      // 如果 respond 是一个函数，就调用它并传入请求和响应对象，然后返回结果。
      // 如果 respond 不是函数，直接返回 respond 对象。
      res.json(Mock.mock(respond instanceof Function ? respond(req, res) : respond))
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
