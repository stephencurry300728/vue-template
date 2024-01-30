// 引入 Mock.js 库，用于生成模拟数据
const Mock = require('mockjs')

// 使用 Mock.mock 方法创建模拟数据
const data = Mock.mock({
  // 'items|30' 指创建一个包含30个元素的数组，每个元素都按照下面的规则生成
  'items|30': [{
    id: '@id', // 使用 '@id' 生成一个唯一的ID
    title: '@sentence(10, 20)', // 生成一个长度为10到20的句子作为标题
    'status|1': ['published', 'draft', 'deleted'], // 随机生成一个状态，值为'published'、'draft'或'deleted'中的一个
    author: 'name', // 'name' 字段暂时是一个静态值，应该是个错误，通常这里应该是个动态生成的名称
    display_time: '@datetime', // 生成一个随机的日期时间
    pageviews: '@integer(300, 5000)' // 生成一个300到5000之间的随机整数作为页面浏览次数
  }]
})

// module.exports 导出一个数组，数组中的每个对象对应一个模拟的 API 路径和处理函数
module.exports = [
  {
    url: '/vue-admin-template/table/list', // 定义请求的 URL 路径
    type: 'get', // 指定请求类型仅为 GET
    response: config => { // 定义响应的处理函数，config 参数包含请求的详细信息
      const items = data.items // 从模拟数据中获取 items 数组
      return {
        code: 20000, // 指定响应的状态码为 20000
        data: { // 返回的数据对象
          total: items.length, // total 字段表示 items 数组的长度
          items: items // items 字段就是模拟生成的数据数组
        }
      }
    }
  }
]
