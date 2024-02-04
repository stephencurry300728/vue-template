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
        start-placeholder="开始日期" end-placeholder="结束日期" @input="onDateRangeChange">
      </el-date-picker>
    </div>

    <el-table class="custom-table" v-loading="listLoading" :data="list" element-loading-text="拼命加载中" border fit
      highlight-current-row stripe @sort-change="handleSortChange" height="758">
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

      <!-- 定义goToDetail能够通过车型去特定测评 -->
      <el-table-column label="车型" prop="train_model" sortable="custom" align="center">
        <template slot-scope="scope">
          <span class="link-like" @click.stop="goToDetail(scope.row)">
            {{ scope.row.train_model }}</span>
        </template>
      </el-table-column>

      <!-- 通过goToDetail能够通过考核项目去特定测评 -->
      <el-table-column label="考核项目" prop="assessment_item" sortable="custom" align="center">
        <template slot-scope="scope">
          <span class="link-like" @click="goToDetail(scope.row)">
            {{ scope.row.assessment_item }}</span>
        </template>
      </el-table-column>

      <!-- 转换器考核结果 -->
      <el-table-column label="考核结果" prop="assessment_result" sortable="custom" align="center">
        <template slot-scope="scope">
          {{ formatAssessmentResult(scope.row.assessment_result) }}
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
      list: [],
      listLoading: true,
      total: 0,
      currentPage: 1,
      pageSize: 12,
      sort: {
        prop: '',
        order: ''
      },
      // 设置dateRange的初始测评日期，其中起始日期为2023-10-10
      dateRange: [new Date(2023, 9, 10), undefined], // JavaScript中月份是从0开始的，所以10月是9
      editDialogVisible: false, // 控制编辑对话框的显示
      editForm: {}, // 存储正在编辑的行的数据
    }
  },

  // 在组件创建时就获取数据
  created() {
    this.fetchData();
  },

  methods: {
    // 获取数据并分页和排序
    fetchData() {
      this.listLoading = true;
      // 初始化请求参数
      const params = {
        page: this.currentPage,
        page_size: this.pageSize,
        ordering: this.sort.order === 'asc' ? this.sort.prop : `-${this.sort.prop}`,
      };

      // 检查dateRange是否有两个日期，如果有，则添加到请求参数
      if (this.dateRange && this.dateRange.length === 2) {
        params.start_date = dayjs(this.dateRange[0]).format('YYYY-MM-DD');
        params.end_date = dayjs(this.dateRange[1]).format('YYYY-MM-DD');
      } // 如果dateRange为空或不完整，不添加日期范围参数，即请求全部数据

      // 打印请求参数
      // console.log("Fetching data with params---------------:", params);
      getList(params).then(response => {
        this.total = response.data.count;
        this.list = response.data.results;
        this.listLoading = false; // 成功获取数据后，停止加载状态
      }).catch(error => {
        console.error("There was a problem fetching the data:", error);
        this.listLoading = false; // 请求出错也要确保停止加载状态
      });
    },

    /**
     * 根据考核结果的数值转换为对应的文本
     * @param {Number} value 考核结果的数值。预期值为 0 到 3。
     * @return {String} 返回考核结果的文本。可能的返回值包括"优秀"、"合格"、"不合格"、"其他"。
     */
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

    // 日期范围选择器的值发生变化时触发
    onDateRangeChange(value) {
      // fetchData将处理是否包含日期范围的逻辑
      this.fetchData();
    },

    // 排序变化时触发
    handleSortChange({ prop, order }) {
      // 检查是否是连续点击同一个列
      if (this.sort.prop === prop) {
        // 如果是，则根据当前的排序方向反转
        this.sort.order = this.sort.order === 'asc' ? 'desc' : 'asc';
      } else {
        // 如果不是，则重置排序属性和方向
        this.sort.prop = prop;
        this.sort.order = order === 'ascending' ? 'asc' : 'desc';
      }
      // 重新获取数据
      this.fetchData();
    },

    // 分页的当前页变化时触发
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchData()
    },

    // 每页大小pagesize变化时触发
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchData()
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

<!-- 网页样式 -->
<style scoped>
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

<!-- 全局样式 -->
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