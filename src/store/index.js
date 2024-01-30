import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import settings from './modules/settings'
import user from './modules/user'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app, // 将 app 模块加入 Vuex store
    settings, // 将 settings 模块加入 Vuex store
    user // 将 user 模块加入 Vuex store
  },
  getters // 加入全局 getters
})

export default store
