<template>
  <div class="app-container">
    <!-- 
    表格组件tabel的属性:
      1.自定义指令v-loading: 表格组件加载时的loading效果 
      这个值通常会根据数据加载的状态来动态改变，比如在发送请求获取数据时设置为 true，数据加载完成后设置为 false
      2.data: 表格组件将来需要真实的内容 ----数组array类型
      3.element-loading-text: 表格组件加载时的文字提示
      4.border：给表格添加边框
      5.fit：表格自适应
      6.highlight-current-row：高亮当前行
    -->
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="拼命加载中"
      border
      fit
      highlight-current-row
    >
      <!-- 第一列 
        表格列column的属性:
      1.label: 列显示的标题，即表头
      2.width: 对应列的宽度
      3.align: 表头的对齐方式
      4.prop: 对应列内容的字段名
    -->
      <el-table-column align="center" label="ID" width="95">
        <!-- 声明一个作用域插槽 
        scope 是一个对象，能够访问与表格的每一行相关的数据和方法
        -->
        <template slot-scope="scope">
          <!-- $index 是 ElementUI 提供的一个属性，用于获取当前表格行的行号 -->
          {{ scope.$index }}
        </template>
      </el-table-column>

      <!-- 第二列 -->
      <el-table-column label="标题" align="center">
        <template slot-scope="scope">
          <!-- scope.row 指的是当前行的数据对象，title 是该对象的一个属性 -->
          {{ scope.row.title }}
        </template>
      </el-table-column>

      <!-- 第三列 -->
      <el-table-column label="作者" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.author }}</span>
        </template>
      </el-table-column>

      <!-- 第四列 -->
      <el-table-column label="Pageviews" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.pageviews }}
        </template>
      </el-table-column>

      <!-- 第五列 -->
      <el-table-column class-name="status-col" label="状态" width="110" align="center">
        <template slot-scope="scope">
          <!-- 调用filters中的 statusFilter 方法-->
          <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>

      <!-- 第六列 -->
      <el-table-column align="center" prop="created_at" label="展示时间" width="200">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span>{{ scope.row.display_time }}</span>
        </template>
      </el-table-column>
    
    </el-table>

    <!-- 需要用到分页器 el-pagnation 
    current-page: 当前页码，代表当前第几页
    total: 数据的总数
    page-size: 每页显示多少条数据
    page-sizes: 每页显示多少条数据的选择器，是一个数组array类型
    layout: 分页器的布局，"prev, pager, next, jumper, ->, total, slot"，其中 slot 表示分页组件的插槽
    pager-count: 页码按钮的数量，当总页数超过该值时会折叠
    -->
  </div>
</template>

<script>
import { getList } from '@/api/table'

export default {
  // 用于定义可以在模板插值中使用的过滤器函数。一般用于格式化文本，比如日期格式化、数字格式化、字符串转换等
  filters: {
    // 将状态代码（如 published, draft, deleted）转换为对应的字符串
    // element-ui 的标签组件 el-tag 有一个属性 type，可以设置标签的类型，比如 success、info、warning、danger 等
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      // list: 表格的数据
      list: null,
      // listLoading: 表格加载时的loading效果默认设置为真（第一次打开）
      listLoading: true
    }
  },
  created() {
    // 在组件创建时就调用fetchData方法来获取表格数据
    this.fetchData()
  },
  methods: {
    // 负责从后端 API 获取数据并更新list的赋值，同时控制加载指示器的显示
    fetchData() {
      // 开启loading效果
      this.listLoading = true
      // 调用api/table.js中的getList方法来获取表格数据
      getList().then(response => {
        // 将获取到的数据赋值给list
        this.list = response.data.items
        // 关闭loading效果
        this.listLoading = false
      })
    }
  }
}
</script>
