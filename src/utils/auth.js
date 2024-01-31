// 引入 js-cookie 库，它是一个简单、轻量的处理浏览器 Cookies 的 JavaScript API
import Cookies from 'js-cookie'

// TokenKey 是一个常量，定义了存储在 Cookies 中的 token 的键名
const TokenKey = 'vue_admin_template_token'

// 定义并导出 getToken 函数
export function getToken() {
  // 使用 js-cookie 的 get 方法，根据 TokenKey 从 Cookies 中获取 token
  // 如果找到了 token，它将被返回；如果没有找到，返回 undefined
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
