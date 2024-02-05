<template>
  <div class="app-container">

    <!-- 编辑数据的遮盖对话框 -->
    <el-dialog title="编辑数据" :visible.sync="editDialogVisible" align="center" class="custom-dialog">
      <el-form :model="editForm" class="compact-form">
        <el-form-item label="记录日期">
          <el-input v-model="editForm.record_date" disabled></el-input>
        </el-form-item>
        <el-form-item label="乘务班组">
          <el-input v-model="editForm.crew_group"></el-input>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
        <el-form-item label="工作证号">
          <el-input v-model="editForm.work_certificate_number"></el-input>
        </el-form-item>
        <el-form-item label="车型">
          <el-input v-model="editForm.train_model" disabled></el-input>
        </el-form-item>
        <el-form-item label="考核项目">
          <el-input v-model="editForm.assessment_item" disabled></el-input>
        </el-form-item>
        <el-form-item label="考核结果">
          <el-input :value="formatAssessmentResult(editForm.assessment_result)" readonly></el-input>
        </el-form-item>
        <el-form-item label="文件来源">
          <el-input v-model="editForm.file_name" disabled></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </span>
    </el-dialog>

    <!-- 外部容器用于定位日期选择器 -->
    <div class="date-picker-offset">
      <el-date-picker v-model="dateRange" type="daterange" style="width: 250px;" range-separator="至"
        start-placeholder="开始日期" end-placeholder="结束日期" @input="onDateRangeChange" @change="onDateRangeChange" />
    </div>

    <!-- 表格组件 -->
    <el-table class="custom-table" v-loading="listLoading" :data="list" element-loading-text="拼命加载中" border fit
      highlight-current-row stripe @sort-change="handleSortChange" height="758"
      :default-sort="{ prop: sort.prop, order: sort.order }">
      <!-- 表的内容 -->
      <el-table-column align="center" label="ID" width="70">
        <!-- 作用域插槽 scope 是一个对象，能够访问与表格的每一行相关的数据和方法-->
        <template slot-scope="scope">
          <!-- $index 是 ElementUI 提供的一个属性，用于获取当前表格行的行号 -->
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>

      <el-table-column label="记录日期" prop="record_date" sortable="custom" align="center" />
      <el-table-column label="乘务班组" prop="crew_group" sortable="custom" align="center" />
      <el-table-column label="姓名" prop="name" sortable="custom" align="center" />
      <el-table-column label="工作证号" prop="work_certificate_number" sortable="custom" align="center" />

      <!-- 定义 goToDetail 能够通过车型去特定的测评数据 -->
      <el-table-column label="车型" prop="train_model" sortable="custom" align="center">
        <template slot-scope="scope">
          <span class="link-like" @click.stop="goToDetail(scope.row)">
            {{ scope.row.train_model }}</span>
        </template>
      </el-table-column>

      <!-- 通过goToDetail能够通过考核项目去特定的测评数据 -->
      <el-table-column label="考核项目" prop="assessment_item" sortable="custom" align="center">
        <template slot-scope="scope">
          <span class="link-like" @click="goToDetail(scope.row)">
            {{ scope.row.assessment_item }}</span>
        </template>
      </el-table-column>

      <!-- 转换考核结果 -->
      <el-table-column label="考核结果" prop="assessment_result" sortable="custom" align="center">
        <template slot-scope="scope">
          <span :class="getAssessmentClass(scope.row.assessment_result)">
            {{ formatAssessmentResult(scope.row.assessment_result) }}
          </span>
        </template>
      </el-table-column>


      <!-- 操作列 定义了部分编辑 PATCH 和单例删除 DELETE -->
      <el-table-column fixed="right" label="操作" width="120" align="center">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="editItem(scope.row)">
            <i class="el-icon-edit"></i> 编辑
          </el-button>
          <el-button type="text" size="small" @click="deleteItem(scope.row)" style="margin-left: 10px; color: red;">
            <i class="el-icon-delete"></i> 删除
          </el-button>
        </template>
      </el-table-column>

    </el-table>

    <!-- 为分页器添加FlexBox 能够居中-->
    <div class="pagination-container">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
        :page-sizes="[12, 30, 50, 100, total]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>

  </div>
</template>

<script>
import { getList, updateItem, deleteItem } from '@/api/table' // 导入获取数据的API
import dayjs from 'dayjs' // 导入日期处理库

export default {
  data() {
    return {
      list: [], // 存储表格数据
      listLoading: true, // 控制表格加载状态，默认为true
      total: 0,  // 总共数据
      currentPage: 1,  // 当前页码
      pageSize: 12, // 每页大小
      sort: {
        prop: '', // 排序的字段
        order: '' // 排序方式 ascending为升序，descending为降序,
      },
      dateRange: [new Date(2023, 9, 10), undefined], // 日期范围选择器的值
      editDialogVisible: false, // 编辑对话框的显示状态
      editForm: {}, // 编辑表单的数据
    };
  },
  created() {
    this.restoreStateFromRouteQuery();
    this.fetchData();
  },
  watch: {
    '$route.query': {
      handler: 'restoreStateFromRouteQuery',
      immediate: false,
    },
  },
  methods: {
    fetchData() {
      // 开启表格加载
      this.listLoading = true;
      // 根据this.sort.order的值来决定排序参数的值
      // 如果this.sort.order的值为descending，则ordering的值为-this.sort.prop，否则为this.sort.prop
      // 用来和后端接口 ordering 适配
      const ordering = this.sort.order === 'descending' ? `-${this.sort.prop}` : this.sort.prop;
      // 带着请求参数调用API
      const params = {
        page: this.currentPage, // 传递给API的页码
        page_size: this.pageSize, // 传递给API的每页大小
        ordering: ordering, // 传递给API的排序字段
        start_date: '', // 起始日期，默认为空字符串
        end_date: '', // 终止日期，默认为空字符串
      };

      // 如果日期范围非空，则更新 params 并使用dayjs库来格式化日期
      if (this.dateRange[0]) params.start_date = dayjs(this.dateRange[0]).format('YYYY-MM-DD');
      if (this.dateRange[1]) params.end_date = dayjs(this.dateRange[1]).format('YYYY-MM-DD');

      // 调用API 文件夹下的自定义 getList函数，并将 params 作为参数传入
      getList(params)
        .then(response => {
          // 获取到请求后将数据赋值给list
          this.list = response.data.results;
          // 获取到请求后将总共数据赋值给total
          this.total = response.data.count;
        })
        .finally(() => this.listLoading = false); // 停止加载
    },

    // 转换考核结果呈现在表格中
    formatAssessmentResult(value) {
      switch (value) {
        case 3:
          return '优秀';
        case 2:
          return '合格';
        case 1:
          return '不合格';
        default:
          return '其他';
      }
    },

    // 根据考核结果返回不同的样式
    getAssessmentClass(value) {
      switch (value) {
        case 3:
          return 'highlight-blue'; // 优秀
        case 2:
          return 'highlight-green'; // 合格
        case 1:
          return 'highlight-red'; // 不合格
        default:
          return ''; // 其他情况不添加特殊样式
      }
    },
    /*
    根据当前页码、页面大小、排序属性、排序顺序以及日期范围来更新当前路由的查询参数
    当用户在浏览器中刷新页面或者复制并粘贴URL时，这些参数的值就会被保留下来
      */
    updateRouteQuery() {
      this.$router.push({
        query: {
          ...this.$route.query, //
          page: this.currentPage,
          pageSize: this.pageSize,
          sortProp: this.sort.prop,
          sortOrder: this.sort.order,
          startDate: this.dateRange[0] ? dayjs(this.dateRange[0]).format('YYYY-MM-DD') : '',
          endDate: this.dateRange[1] ? dayjs(this.dateRange[1]).format('YYYY-MM-DD') : '',
        }
      });
    },

    // 日期范围选择器的值发生变化时（输入和取消）触发
    onDateRangeChange(value) {
      // 检查日期范围是否为空或者长度为0以及 value 的第一个元素和第二个元素是否都不存在
      // 如果是则清空日期范围，否则更新日期范围
      if (!value || value.length === 0 || (!value[0] && !value[1])) {
        // 清空日期范围
        this.dateRange = [undefined, undefined];
      } else {
        // 更新日期范围赋值给dateRange
        this.dateRange = value;
      }
      this.currentPage = 1; // 重置到第一页，改变日期范围可能会改变数据的总数，所以需要回到第一页
      this.updateRouteQuery(); // 更新URL查询参数，将新的日期范围和页码保存在 URL 中 这样当用户刷新页面或者在浏览器中前进后退时，这些状态就会被保留下来
    },

    // 从当前路由的查询参数中恢复状态
    restoreStateFromRouteQuery() {
      // 从this.$route.query中解构赋值
      const {
        page,
        pageSize,
        sortProp,
        sortOrder,
        startDate,
        endDate
      } = this.$route.query;
      if (page) this.currentPage = parseInt(page);
      if (pageSize) this.pageSize = parseInt(pageSize);
      if (sortProp) this.sort.prop = sortProp;
      if (sortOrder) this.sort.order = sortOrder === 'ascending' ? 'ascending' : 'descending';
      if (startDate) this.dateRange[0] = new Date(startDate);
      if (endDate) this.dateRange[1] = new Date(endDate);
    },

    // 处理排序改变
    handleSortChange({
      prop,
      order
    }) {
      // 当前排序的属性是否等于传入的属性
      if (this.sort.prop === prop) {
        // 如果是，则切换排序顺序
        this.sort.order = this.sort.order === 'ascending' ? 'descending' : this.sort.order === 'descending' ? '' : 'ascending';
        // 清空了排序顺序，那么也需要清空排序的属性
        if (this.sort.order === '') {
          this.sort.prop = ''; // Remove sorting
        }
      } else {
        // 如果不是，则更新排序的属性和排序的顺序
        this.sort.prop = prop;
        // this.sort.order = 'ascending';
        this.sort.order = order;
      }
      // 更新 URL 的查询参数,将新的排序属性和排序顺序保存在 URL 中
      this.updateRouteQuery();
    },

    // 分页器的页码改变时触发
    handleCurrentChange(val) {
      this.currentPage = val;
      this.updateRouteQuery();
    },

    // 分页器的每页大小改变时触发
    handleSizeChange(val) {
      this.pageSize = val;
      this.updateRouteQuery();
    },

    // 点击编辑特定行并弹出对话框
    editItem(row) {
      this.editForm = Object.assign({}, row); // 使用 Object.assign 防止直接修改数据
      this.editDialogVisible = true; // 打开遮罩层对话框
    },

    // 具体执行部分更新 PATCH 特定行
    saveEdit() {
      const id = this.editForm.id;
      updateItem(id, this.editForm)
        .then(() => {
          this.editDialogVisible = false; // 更新完毕后自动关闭对话框
          this.fetchData(); // 重新加载更新后的数据
          this.$message.success('更新成功');
        })
        .catch(error => {
          console.error("更新失败:", error);
          this.$message.error('更新失败');
        });
    },

    // 具体删除 DELETE 特定行
    deleteItem(row) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 用户确认删除，调用 API 删除数据
        deleteItem(row.id).then(() => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
          // 刷新列表，重新获取删除后数据
          this.fetchData();
        }).catch(error => {
          this.$message.error('删除失败');
        })
      }).catch(() => {
        // 用户取消删除
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },

    // 传递该id的所有信息到Vuex并跳转到详情页/table/detail/${id}
    // 这个参数 item 是 row.scope 即当前行的完整数据
    goToDetail(item) {
      // 指定行的完整数据，包含了该id的所有信息，由于没有逻辑处理和api获取 直接 commit 传递到Vuex
      this.$store.commit('table/setCurrentDetail', item);
      // 根据item中的assessment_detail_url提取ID
      // 例如 http://127.0.0.1:8000/api/assessment-10a02/2706/
      // 按照 / 分割后的数组为 ["http:", "", "127.0.0.1:8000", "api", "assessment-10a02", "2706", ""]
      // 取这个数组的倒数第二个元素，即 2706 并作为id传递到详情页
      const id = item.assessment_detail_url.split('/').slice(-2, -1)[0];
      // 再利用路由器导航到详情页面
      this.$router.push(`/table/detail/${id}`);
    },
  }
}
</script>

<!-- 网页局部样式 -->
<style scoped>
.app-container {
  padding-top: 0px;
  padding-bottom: 0px;
  /* 与浏览器窗口的间距 */
}

.highlight-red {
  background-color: #ffebee;
  /* 浅红色背景 */
  color: #d32f2f;
  /* 深红色文本，以确保对比度和可读性 */
  padding: 2px 8px;
  margin: 0 2px;
  /* 添加一些内边距 */
  border-radius: 4px;
  /* 圆角边框 */
  border: 1px solid #f44336;
  /* 红色边框 */
  font-weight: bold;
  /* 加粗字体增加突出效果 */
  text-align: center;
  /* 文本居中显示 */
}

/* 合格的样式 */
.highlight-green {
  background-color: #e8f5e9;
  /* 浅绿色背景 */
  color: #2e7d32;
  /* 深绿色文本 */
  padding: 2px 8px;
  margin: 0 2px;
  border-radius: 4px;
  border: 1px solid #4caf50;
  /* 绿色边框 */
  font-weight: bold;
  text-align: center;
}

/* 优秀的样式 */
.highlight-blue {
  /* 浅蓝色背景 */
  color: #000c0c;
  /* 深蓝色文本 */
  padding: 2px 8px;
  margin: 0 2px;
  border-radius: 4px;
  border: 1px solid #0a000e;
  /* 蓝色边框 */
  font-weight: bold;
  text-align: center;
}

.custom-dialog {
  margin-top: -70px;
  /* 根据需要调整对话框的垂直位置 */
}

.compact-form .el-form-item {
  margin-bottom: 4px;
  /* 减少表单项之间的垂直间距 */
}

.link-like {
  display: inline-block;
  padding: 2px 8px;
  margin: 0 2px;
  border: 1px solid #409EFF;
  /* 使用Element UI的默认蓝色作为边框颜色 */
  color: #409EFF;
  border-radius: 4px;
  /* 圆角边框 */
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  font-size: 14px;
  /* 调整字体大小 */
  background-color: #fff;
  /* 初始背景颜色 */
}

.link-like:hover {
  background-color: #409EFF;
  /* 鼠标悬停时背景颜色变化 */
  color: #fff;
  /* 鼠标悬停时文字颜色变为白色 */
}

.date-picker-offset {
  margin: 0;
  padding-left: 50px;
  /* 推动日期选择器向右边移动 */
}

.pagination-container {
  display: flex;
  /* 启用 Flexbox 布局 */
  justify-content: center;
  /* 水平居中 */
  align-items: center;
  /* 垂直居中 (如果需要) */
  margin-top: 20px;
  /* 与上方表格的间距 */
}
</style>

<!-- 网页全局样式 -->
<style>
/* 如果是在 .vue 文件的 <style> 中添加，考虑使用 scoped 属性或者根据实际情况决定 */
.el-table {
  margin-top: 0px;
  /* 与日期范围选择器的间距 */
}

.el-table th {
  background-color: #f2f2f2;
  /* 背景色 */
  color: #333;
  /* 字体颜色 */
  font-weight: bold;
  /* 字体加粗 */
  line-height: normal;
  /* 行高 */
  border-bottom: 2px solid #e8e8e8;
  /* 底部边框 */
}

.custom-table .el-table__header-wrapper th {
  background-color: #f2f2f2 !important;
  color: #333 !important;
  font-weight: bold !important;
  line-height: normal !important;
  border-bottom: 2px solid #e8e8e8 !important;
}

.el-table__fixed-right-patch {
  position: absolute;
  top: -1px;
  right: 0;
  background-color: #ffffff00 !important;
  /* 设置为透明 */
}
</style>
