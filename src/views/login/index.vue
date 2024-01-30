<template>
  <div class="login-container">
    <!-- model：表单数据对象 rules：表单验证规则-->
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on" label-position="left">

      <div class="title-container">
        <h3 class="title">登 录</h3>
      </div>

      <!-- 在 Form 组件中，每一个表单域由一个 Form-Item 组件构成，表单域中可以放置各种类型的表单控件
      包括 Input、Select、Checkbox、Radio、Switch、DatePicker、TimePicker -->
      <el-form-item prop="username">
        <span class="svg-container">
          <!-- 矢量小图标 -->
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="username"
          v-model="loginForm.username"
          placeholder="用户名"
          name="username"
          type="text"
          tabindex="1"
          auto-complete="on"
        />
      </el-form-item>

      <el-form-item prop="password">
        <span class="svg-container">
          <!-- 矢量小图标 -->
          <svg-icon icon-class="password" />
        </span>
        <!--  通过 @keyup.enter.native 监听键盘事件，当用户按下回车键时，调用 handleLogin 方法 -->
        <el-input
          :key="passwordType"
          ref="password"
          v-model="loginForm.password"
          :type="passwordType"
          placeholder="密码"
          name="password"
          tabindex="2"
          auto-complete="on"
          @keyup.enter.native="handleLogin"
        />
        <span class="show-pwd" @click="showPwd">
          <!-- 矢量小图标样式的切换 -->
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>

      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handleLogin">登录</el-button>

      <div class="tips">
        <span style="margin-right:20px;">用户名：admin</span>
        <span> 密码：任何密码都行</span>
      </div>

    </el-form>
  </div>
</template>

<script>
import { validUsername } from '@/utils/validate'

export default {
  name: 'Login',
  data() {
    // 检查用户名是否属于预定义的有效列表
    // valid_map = ['admin', 'editor']
    const validateUsername = (rule, value, callback) => {
      // 调用 validUsername 函数，传入用户输入的用户名
      if (!validUsername(value)) {
        // 如果用户名不在有效列表中，则通过 callback 返回一个错误信息
        callback(new Error('Please enter the correct user name'))
      } else {
        // 如果用户名在有效列表中，通过 callback 正常返回
        callback()
      }
    }
    // validatePassword 是一个自定义验证函数，用于验证密码
    const validatePassword = (rule, value, callback) => {
      // 简单的密码长度验证
      if (value.length < 6) {
        callback(new Error('The password can not be less than 6 digits'))
      } else {
        callback()
      }
    }

    return {
      // 收集表单信息绑定在 :model="loginForm" 上，loginForm 是一个对象，包含用户名和密码
      // 组件的 data 返回对象，包含表单数据和验证规则
      loginForm: {
        // 默认用户名和密码
        username: 'admin',
        password: '111111'
      },
      loginRules: {
        // 当用户在表单中填写用户名并失去焦点时（即触发 blur 事件），validateUsername 函数被触发
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        // 为密码字段设置验证规则，使用 validatePassword 函数
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  methods: {
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    //登陆业务:发请求，带着用户名与密码给服务器（返回成功与失败）
    handleLogin() {
      // 验证表单（用户名与密码）是否符合规则
      this.$refs.loginForm.validate(valid => {
        // 如果符合规则
        if (valid) {
          // 按钮会有一个loading的效果
          this.loading = true
          // 带着用户名与密码的载荷派发一个action给user.js下面的login
          this.$store.dispatch('user/login', this.loginForm).then(() => {
            // 登陆成功进行路由的跳转到首页
            this.$router.push({ path: this.redirect || '/' })
            // loading效果结束
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg:#283443;
$light_gray:#fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
</style>
