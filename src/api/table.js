// 引入一个封装了 Axios 实例的 JavaScript 模块（request.js 文件）
// 这个模块导出了一个配置好的 Axios 实例，用于发起网络请求
import request from '@/utils/request'

export function getList(params) {
  return request({
    // 定义 API 请求的 URL 地址
    // baseURL: process.env.VUE_APP_BASE_API
    // 最后在浏览器的url = base url + request url
    url: '/assessment-base/', // request url
    // 定义请求方法为 get
    method: 'get',
    params
  })
}

// 编辑api
export function updateItem(id, data) {
  return request({
    url: `/assessment-base/${id}/`,
    method: 'put',
    data
  })
}