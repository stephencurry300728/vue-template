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

// 部分修改数据万一有错误
export function updateItem(id, data) {
  return request({
    url: `/assessment-base/${id}/`,
    method: 'patch',
    data
  })
}

// 封装删除操作的 API 请求
export function deleteItem(id) {
  return request({
    url: `/assessment-base/${id}/`,
    method: 'delete',
  })
}

// 定义根据完整URL获取详细信息的API方法
export function getDetailByUrl(fullUrl) {
  // 定义API的基础路径
  const apiBasePath = 'http://127.0.0.1:8000/api';

  // 去除完整API基础路径，只保留相对路径
  let relativeUrl = fullUrl.replace(apiBasePath, '');

  // 使用封装后的request模块进行GET请求
  return request({
    url: relativeUrl, // 直接使用处理后的相对URL
    method: 'get',
  });
}