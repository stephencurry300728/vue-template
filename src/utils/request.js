import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// 创建 axios 实例
const service = axios.create({
  // 从环境变量获取的基础 URL
  baseURL: process.env.VUE_APP_BASE_API, // 最后在浏览器的url = base url + request url进行拼接
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // 请求超时时间为5s
})

/* 当一个请求通过 service 发送时，它首先经过这个请求拦截器
/* 如果 Vuex store 中有 token，拦截器会修改请求的 config，添加 token 到请求头
/* 然后，修改后的 config 用于发送实际的 HTTP 请求
/* 如果在发送请求的过程中发生错误，错误处理函数将被调用，并且错误信息被传递出去
*/

// 定义请求前的拦截器(由于封装request的原因，每一个请求都会经过这个拦截器)
service.interceptors.request.use( 
// 第一个箭头函数接受一个 config 对象作为参数，这个对象包含即将发送的 HTTP 请求的配置信息。
// 如果 Vuex store 中存在 token，就将这个 token 添加到请求的 headers 中。这通常用于 API 请求的身份验证。
// 然后，这个函数返回修改后的 config 对象，确保这些改动被应用到实际的请求中。
  config => {
    // 发送请求前的处理逻辑
    if (store.getters.token) {
      // let each request carry token
      config.headers['Authorization'] = 'Bearer ' + getToken()
    }
    return config
  },
  error => {
    // 请求错误处理
    console.log(error) // 调试用
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  // 拿到响应后的处理逻辑并赋值给 response
  response => {
    const res = response
    return res
  },
  error => {
    // 响应错误处理
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
