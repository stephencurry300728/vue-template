// 引入axios(axios的二次封装)
import request from '@/utils/request'

// 登录接口函数
// 发送一个 HTTP 请求到后端服务，用于进行用户登录
export function login(data) {
  return request({
    url: '/login/',
    method: 'post',
    data
  })
}
// 获取用户信息的函数
export function getInfo(token) {
  return request({
    url: '/info/',
    method: 'get',
    params: { token }
  })
}
// 退出登录的函数
export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  })
}
