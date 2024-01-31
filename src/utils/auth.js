// 引入 js-cookie 库，它是一个简单、轻量的处理浏览器 Cookies 的 JavaScript API
import Cookies from 'js-cookie'

// 定义了存储在 Cookies 中的 token 的键名Key(Name）
// 当调用 setToken(token) 时，js-cookie 库会在浏览器的 Cookies 中创建一个键名为 'vue_admin_template_token' 的项，
// 并将传入的 token 作为其值。
// 同样，当调用 getToken() 时，它会查找键名为 'vue_admin_template_token' 的项，并返回其值
const TokenKey = 'vue_admin_template_token'

// 获取当前存储在 Cookies 中的 token
export function getToken() {
  return Cookies.get(TokenKey)
}

// 将 token 存储到 Cookies 中
export function setToken(token) {
  // 在用户登录时，调用 setToken 将 token 存储到 Cookies 中
  return Cookies.set(TokenKey, token)
}

// 从 Cookies 中移除 token
export function removeToken() {
  // 在用户登出或需要移除登录状态时，调用 removeToken
  return Cookies.remove(TokenKey)
}
