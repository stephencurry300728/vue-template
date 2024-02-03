<template>
  <div class="app-container">

    <el-dialog title="编辑数据" :visible.sync="editDialogVisible" align="center" class="custom-dialog">
      <el-form :model="editForm" class="compact-form">
        <el-form-item label="乘务班组">
          <el-input v-model="editForm.crew_group"></el-input>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
        <el-form-item label="工作证号">
          <el-input v-model="editForm.work_certificate_number"></el-input>
        </el-form-item>
        <!-- 不可编辑的字段展示 -->
        <el-form-item label="记录日期">
          <el-input v-model="editForm.record_date" disabled></el-input>
        </el-form-item>
        <el-form-item label="车型">
          <el-input v-model="editForm.train_model" disabled></el-input>
        </el-form-item>
        <el-form-item label="考核项目">
          <el-input v-model="editForm.assessment_item" disabled></el-input>
        </el-form-item>
        <el-form-item label="考核结果">
          <el-input v-model="editForm.assessment_result" disabled></el-input>
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

    <el-table v-loading="listLoading" :data="list" element-loading-text="拼命加载中" border fit highlight-current-row stripe
      @sort-change="handleSortChange">
      <el-table-column align="center" label="ID" width="70">
        <!-- 声明一个作用域插槽 scope 是一个对象，能够访问与表格的每一行相关的数据和方法-->
        <template slot-scope="scope">
          <!-- $index 是 ElementUI 提供的一个属性，用于获取当前表格行的行号 -->
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="记录日期" prop="record_date" sortable="custom" align="center" />
      <el-table-column label="乘务班组" prop="crew_group" sortable="custom" align="center" />
      <el-table-column label="姓名" prop="name" sortable="custom" align="center" />
      <el-table-column label="工作证号" prop="work_certificate_number" sortable="custom" align="center" />
      <el-table-column label="车型" prop="train_model" sortable="custom" align="center" />
      <el-table-column label="考核项目" prop="assessment_item" sortable="custom" align="center" />
      <el-table-column label="考核结果" prop="assessment_result" sortable="custom" align="center" />

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

    <!-- 添加flexbox -->
    <div class="pagination-container">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
        :page-sizes="[10, 20, 30]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

  </div>
</template>

<script>
import { getList, updateItem, deleteItem } from '@/api/table' // 假设这个文件在 '@/api/table' 路径下
import dayjs from 'dayjs'

export default {
  data() {
    return {
      list: [],
      listLoading: true,
      total: 0,
      currentPage: 1,
      pageSize: 10,
      sort: {
        prop: '',
        order: ''
      },
      // 设置dateRange的初始值，其中起始日期为2023-10-10
      dateRange: [new Date(2023, 9, 10), undefined], // JavaScript中月份是从0开始的，所以10月是9
      editDialogVisible: false, // 控制编辑对话框的显示
      editForm: {}, // 存储正在编辑的行的数据
    }
  },
  created() {
    this.fetchData()
  },

  methods: {
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

      console.log("Fetching data with params:", params);
      getList(params).then(response => {
        this.total = response.data.count;
        this.list = response.data.results;
        this.listLoading = false; // 成功获取数据后，停止加载状态
      }).catch(error => {
        console.error("There was a problem fetching the data:", error);
        this.listLoading = false; // 请求出错也要确保停止加载状态
      });
    },

    onDateRangeChange(value) {
      // fetchData将处理是否包含日期范围的逻辑
      this.fetchData();
    },

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
      this.fetchData();
    },

    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchData()
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchData()
    },
    editItem(row) {
      this.editForm = Object.assign({}, row); // 使用 Object.assign 防止直接修改数据
      this.editDialogVisible = true;
    },

    // 更新
    saveEdit() {
      const id = this.editForm.id;
      updateItem(id, this.editForm)
        .then(() => {
          this.editDialogVisible = false; // 关闭对话框
          this.fetchData(); // 重新加载数据
          this.$message.success('更新成功');
        })
        .catch(error => {
          console.error("更新失败:", error);
          this.$message.error('更新失败');
        });
    },

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
  }
}
</script>

<style scoped>
/* 如果是在 .vue 文件的 <style> 中添加，考虑使用 scoped 属性或者根据实际情况决定 */
.custom-dialog {
  margin-top: -70px;
  /* 根据需要调整对话框的垂直位置 */
}

.compact-form .el-form-item {
  margin-bottom: 4px;
  /* 减少表单项之间的垂直间距 */
}

.el-table {
  margin-top: 0px;
  /* 与日期范围选择器的间距 */
}

.date-picker-offset {
  padding-left: 60px;
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
