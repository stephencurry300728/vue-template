import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: ''
  }
}

const state = getDefaultState()

const actions = {
/* 处理用户登录的业务
  通过解构赋值先得到context对象中的commit方法方便后续Mutation使用
  如果不使用解构赋值，代码将是这样的：
  login(context, userInfo) {
    const commit = context.commit}
}
*/
  login({ commit }, userInfo) {
    /*
    userInfo 是从组件中传递给 Vuex action 的对象，通常包含表单中的数据在 
    userInfo 对象可能是这样的：
    {
      username: "admin",
      password: "111111"
    }
    */
   // 解构出用户名与密码
    const { username, password } = userInfo
    // 创建了一个新的 Promise 对象
    return new Promise((resolve, reject) => {
      // 调用封装好的login函数，向后端api发送登录请求
      login({ username: username.trim(), password: password }).then(
        // 当 login 函数成功返回响应时执行then中的代码
        response => {
        // response 是从后端返回的响应数据，在控制栏打印查看其结构
        console.log(response)
        // 通过解构赋值data获取响应中的数据
        const { data } = response
        // 从响应数据中提取令牌（token）
        const token = data.access
        // 调用 Vuex 的 commit 方法来触发一个 mutation，将获取的令牌保存到 Vuex 的状态中
        commit('SET_TOKEN', token)
        // 将 token 存储到 Cookies 中
        setToken(token)
        // 表示 Promise 成功完成
        resolve()
      }).catch(error => {
        //如果 login 函数在执行过程中遇到错误（如网络错误或后端服务返回错误）
        // 表示 Promise 因错误而失败
        reject(error)
      })
    })
  },

  // 得到登录用户的信息
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          return reject('Verification failed, please Login again.')
        }

        const { name, avatar } = data

        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        // 当用户退出登录时，需要移除cookie并重置路由
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  }
}

export default {
  namespaced: true, // 用于在全局引用此文件里的方法时标识这一个的文件名
  state,
  mutations,
  actions
}

