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

// 新增函数，根据ID获取详情数据
export function fetchDetailById(id) {
  return request({
    url: `/assessment-base/${id}/`, // 这里的URL应该根据你的实际API端点进行调整
    method: 'get'
  });
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

// 新增获取所有train_model和assessment_item的方法
export function fetchAllTrainAndAssessment() {
  return request({
    url: '/assessment-base/all-train-and-assessment/', // 根据实际的url路径调整
    method: 'get',
  });
}

// 由于后端处理了允许无参数的 GET 请求，故该函数可以请求所有不分页的数据，可以是所有的训练数据，也可以是筛选后的数据
export function AllTrainingData(params) {
  return request({
    url: '/assessment-base/unpaged-data/',
    method: 'get',
    params
  });
}