<template>
  <section class="app-main">
    <!-- transition 定义了页面之间切换动画 -->
    <transition name="fade-transform" mode="out-in">
      <!-- router-view 显示当前路由的组件，:key 绑定确保组件在路由改变时重新渲染 -->
      <router-view :key="key" />
    </transition>
  </section>
</template>

<script>
export default {
  name: 'AppMain',
  computed: {
    // 计算属性 key, 根据当前路由路径变化, 返回当前路由的路径
    key() {
      return this.$route.path
    }
  }
}
</script>

<style scoped>
.app-main {
  /* 设置 app-main 最小高度，减去导航栏高度 */
  min-height: calc(100vh - 50px);
  width: 100%;
  position: relative;
  overflow: hidden;
}
.fixed-header+.app-main {
  /* 如果存在 fixed-header 类，则为 app-main 添加顶部间距 */
  padding-top: 50px;
}
</style>

<style lang="scss">
// 修复在打开 el-dialog 时的样式问题
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}
</style>
