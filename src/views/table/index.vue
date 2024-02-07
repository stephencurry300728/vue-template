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

    <!-- 外部容器放置重置按钮、日期选择器、选择框 -->
    <div class="filters-container">
      <!-- 按钮容器 -->
      <div class="reset-button-container">
        <el-button @click="resetFilters" type="primary" size="small">重置</el-button>
      </div>

      <!-- 日期选择器 -->
      <div class="date-picker-offset">
        <el-date-picker v-model="dateRange" type="daterange" style="width: 250px;" range-separator="至"
          start-placeholder="开始日期" end-placeholder="结束日期" @change="onDateRangeChange" />
      </div>

      <!-- 线路选择框 -->
      <div class="select-container">
        <el-select v-model="selectedLine" clearable placeholder="请选择线路" style="width: 150px;" @change="fetchData">
          <el-option label="1号线" value="01"></el-option>
          <el-option label="5号线" value="05"></el-option>
          <el-option label="9号线" value="09"></el-option>
          <el-option label="10号线" value="10"></el-option>
          <el-option label="所有线路" value=""></el-option>
        </el-select>
      </div>

      <!-- 科目选择框 -->
      <div class="select-container select-offset"> <!-- 添加新的类名用于调整样式 -->
        <el-select v-model="selectedOption" :disabled="isSubjectDisabled" clearable placeholder="请选择科目"
          style="width: 222px; height: 40px; font-size: 16px;">
          <el-option v-for="option in filteredOptions" :key="option.value" :label="option.label"
            :value="option.value"></el-option>

        </el-select>

      </div>
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

      <!-- 转换考核结果并定制 优秀、合格、不合格的样式 -->
      <el-table-column label="考核结果" prop="assessment_result" sortable="custom" align="center">
        <template slot-scope="scope">
          <span :class="getAssessmentClass(scope.row.assessment_result)" @click="goToDetail(scope.row)"
            style="cursor: pointer;">
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

    <!-- 为分页器添加 FlexBox 能够居中-->
    <div class="pagination-container">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
        :page-sizes="computedPageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>

  </div>
</template>

<script>
import { getList, updateItem, deleteItem, fetchAllTrainAndAssessment } from '@/api/table' // 导入获取数据的API
import dayjs from 'dayjs' // 导入日期处理库
import { debounce } from 'lodash'; // 引入debounce函数，用于减少重复的API请求

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
      selectedLine: '', // 用于存储线路，默认空值为全部线路
      selectedOption: null, // 用于存储选中的选项
      combinedOptions: [], // 从API获取的train_model和assessment_item的组合   
    };
  },

  // 组件创建时调用 LocalStorage 的查询参数并获取数据
  created() {
    this.fetchData = debounce(this.fetchData, 5); // 使用 debounce 包装 fetchData 方法，50ms 延迟
    this.restoreStateFromLocalStorage();
    this.fetchData();
  },

  // 组件挂载时调用获取所有数据的train_model和assessment_item并赋值给选择框中
  mounted() {
    this.loadAllTrainAndAssessmentItems();
  },

  // 监听路由的查询参数的变化
  watch: {
    '$route.query': {
      handler: 'restoreStateFromRouteQuery',
      immediate: false,
      deep: false,
    },
    // 监听 线路 选项框值的变化
    selectedLine(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.selectedOption = null; // 线路变更时，清空 科 目选择器的值, 重新获取数据
        this.fetchData();
        this.updateFilters(); // 更新URL查询参数
      }
    },

    // 监听 科目 选项框的变化
    selectedOption(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.fetchData(); // 当 selectedOption 更新时重新调用 fetchData() 方法
        this.updateFilters(); // 更新URL查询参数
      }
    },

  },

  computed: {
    // 计算属性，若选择所有线路时该选项无法选择
    isSubjectDisabled() {
      return this.selectedLine === '';
    },

    filteredOptions() {
      if (this.selectedLine === '') {
        return []; // 如果没有选择线路，返回空数组
      } else {
        // 过滤 combinedOptions 来只包含与选定线路匹配的选项
        return this.combinedOptions.filter(option => option.value.startsWith(this.selectedLine));
      }
    },

    computedPageSizes() {
      // 预设的分页大小选项
      let baseSizes = [12, 30, 50, 100];

      // 移除所有大于当前总数 `total` 的分页大小选项
      baseSizes = baseSizes.filter(size => size <= this.total);

      // 添加一个等于 `total` 的分页大小选项，如果它还不在列表中
      if (baseSizes.indexOf(this.total) === -1) {
        baseSizes.push(this.total);
      }

      // 对更新后的分页大小选项进行排序，确保顺序正确
      baseSizes.sort((a, b) => a - b);

      // 返回更新后的分页大小选项
      return baseSizes;
    },
  },

  methods: {
    // 获取数据，基本上每次都要调用
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

      // 检查是否有选中的线路，并将 train_model_line 加入请求参数 params
      if (this.selectedLine) {
        params.train_model_line = this.selectedLine;
      }

      // 检查是否有选中的科目，解耦train_model assessment_item 加入请求参数
      if (this.selectedOption) {
        const [trainModel, assessmentItem] = this.selectedOption.split('-');
        params.train_model = trainModel;
        params.assessment_item = assessmentItem;
      }

      // 调用API 文件夹下的自定义 getList函数，并将所有的 params 作为参数传入
      getList(params)
        .then(response => {
          console.log("获取数据成功:", response);
          // 检查 response.data.results 是否为空。
          // 如果为空并且当前页码 this.currentPage 大于 1，那么将当前页码设置为 1，并再次调用获取数据
          if (!response.data.results.length && this.currentPage > 1) {
            this.currentPage = 1;
            this.fetchData(); // 注意：此处已经是在第一页，因此不会无限递归
          } else {
            // 如果 response.data.results 不为空，那么将其赋值给 this.list
            // 将 response.data.count 赋值给 this.total
            this.list = response.data.results;
            this.total = response.data.count;
            this.listLoading = false;
          }
        })
        .catch(error => {
          console.error("Error fetching data:", error);
          this.listLoading = false;
          // 根据实际情况处理错误，例如显示用户友好的错误信息
          if (this.currentPage > 1) {
            this.currentPage = 1;
            this.fetchData();
          } else {
            // 可能需要在这里处理错误，例如显示错误信息
          }
        })
        .finally(() => {
          this.listLoading = false;
        });
    },

    // 更新当前状态的页码和筛选条件到 LocalStorage 做到保存历史记录
    updateFilters() {
      const filters = {
        page: this.currentPage,
        pageSize: this.pageSize,
        sortProp: this.sort.prop,
        sortOrder: this.sort.order,
        startDate: this.dateRange[0] ? dayjs(this.dateRange[0]).format('YYYY-MM-DD') : '',
        endDate: this.dateRange[1] ? dayjs(this.dateRange[1]).format('YYYY-MM-DD') : '',
        selectedLine: this.selectedLine, // 保存选中的线路
        trainModel: this.selectedOption ? this.selectedOption.split('-')[0] : '', // 拆分value保存选中的车型
        assessmentItem: this.selectedOption ? this.selectedOption.split('-')[1] : '', // 拆分value保存选中的考核项目
      };

      // 将 filters 对象保存到 LocalStorage 中
      localStorage.setItem('tableFilters', JSON.stringify(filters));
    },

    // 日期范围选择器的值发生变化时（输入或取消）触发
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
      this.currentPage = 1; // 重置到第一页，改变日期范围可能会改变数据的总数，所以需要回到第一页，防止出现空白页
      this.updateFilters(); // 更新URL查询参数，将新的日期范围和页码保存在 URL 中 这样当用户刷新页面或者在浏览器中前进后退时，这些状态就会被保留下来
      this.fetchData(); // 根据新的筛选条件重新获取数据
    },

    // 从 LocalStorage 获取参数以恢复表格过滤器的状态
    restoreStateFromLocalStorage() {
      // 定义一个 defaultFilters 对象，该对象包含了所有过滤器的默认值
      const defaultFilters = {
        page: 1,
        pageSize: 12,
        sortProp: '',
        sortOrder: '',
        startDate: '',
        endDate: '',
        trainModel: '',
        assessmentItem: '',
        selectedLine: '',
      };

      // 从本地存储中获取名为 tableFilters 的项
      // 如果该项存在，它会被解析为一个 JavaScript 对象并赋值给 filters 变量
      // 如果该项不存在，filters 变量将被赋予 defaultFilters 的值
      const filters = JSON.parse(localStorage.getItem('tableFilters')) || defaultFilters;

      // 将 filters 对象中的值赋给当前 Vue 实例的相应属性
      this.currentPage = filters.page;
      this.pageSize = filters.pageSize;
      this.sort.prop = filters.sortProp;
      this.sort.order = filters.sortOrder;
      this.dateRange = [
        filters.startDate ? new Date(filters.startDate) : undefined, // 指定默认日期
        filters.endDate ? new Date(filters.endDate) : undefined, // 默认结束日期
      ];
      this.selectedLine = filters.selectedLine; // 恢复选中的线路
      // 如果 filters.trainModel 和 filters.assessmentItem 都存在，它们会被连接成一个字符串并赋给 this.selectedOption
      // 如果它们中的任何一个不存在，this.selectedOption 将被赋值为 null
      this.selectedOption = filters.trainModel && filters.assessmentItem ? `${filters.trainModel}-${filters.assessmentItem}` : null;
    },

    // Select框中加载数据库中所有数据的 train_model 和 assessment_item
    // 调用 fetchAllTrainAndAssessment 获取所有数据的train_model和assessment_item
    loadAllTrainAndAssessmentItems() {
      fetchAllTrainAndAssessment().then(response => {
        // 对获取到的数据按 train_model 进行升序排序
        const sortedData = response.data.sort((a, b) => {
          // 使用 localeCompare 进行字符串比较，以实现车型的升序排列
          return a.train_model.localeCompare(b.train_model);
        });

        // 将排序后的数据映射到 combinedOptions
        this.combinedOptions = sortedData.map(item => ({
          label: `${item.train_model} - ${item.assessment_item}`,
          value: `${item.train_model}-${item.assessment_item}`,
        }));
      }).catch(error => {
        console.error("获取数据失败：", error);
      });
    },

    // 左上角按钮重置筛选条件    
    resetFilters() {
      this.dateRange = [new Date(2023, 9, 10), undefined];
      this.currentPage = 1;
      this.pageSize = 12;
      this.sort = { prop: '', order: '' };
      this.selectedLine = ''; // 清空选中的线路，默认为全部线路
      this.selectedOption = null;
      // 更新 LocalStorage 参数均设置为空
      this.updateFilters();
      // 重新获取数据
      this.fetchData();
    },

    /*
    * 以下是一些辅助函数
    */
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
      // 更新 URL 的查询参数，将新的排序属性和排序顺序保存在 URL 中
      this.updateFilters();
      this.fetchData(); // 根据新的筛选条件重新获取数据
    },

    // 分页器的页码改变时触发
    handleCurrentChange(val) {
      this.currentPage = val; // 更新当前页码
      this.updateFilters(); // 更新URL查询参数到 LocalStorage
      this.fetchData(); // 根据新的筛选条件重新获取数据
    },

    // 分页器的每页大小改变时触发
    handleSizeChange(val) {
      this.pageSize = val; // 更新当前的每页大小
      this.updateFilters(); // 更新URL查询参数到 LocalStorage
      this.fetchData(); // 根据新的筛选条件重新获取数据
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
          return 'highlight-excellent'; // 优秀
        case 2:
          return 'highlight-qualified'; // 合格
        case 1:
          return 'highlight-Unqualified'; // 不合格
        default:
          return ''; // 其他情况不添加特殊样式
      }
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

    // 传递该id的所有信息到Vuex并跳转到详情页/table/detail/${id} 即 AssessmentDetail.vue
    // 这个参数 item 是 row.scope 即当前行的完整数据
    goToDetail(rowData) {
      this.$store.dispatch('table/updateDetailData', rowData); // 注意使用命名空间
      this.$router.push({ name: 'Detail' }); // 使用正确的路由名称
    },
  },
}
</script>

<!-- 网页局部样式 -->
<style scoped>
.app-container {
  padding-top: 0px;
  padding-bottom: 0px;
  /* 与浏览器窗口的间距 */
}

/* 不合格的样式 */
.highlight-Unqualified {
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
.highlight-qualified {
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
.highlight-excellent {
  background-color: #f1dddd;
  color: #aa75af;
  /* 深蓝色文本 */
  padding: 2px 8px;
  margin: 0 2px;
  border-radius: 4px;
  border: 1px solid #e88fee;
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

.filters-container {
  display: flex;
  align-items: center;
  /* 确保子项垂直居中对齐 */
  gap: 10px;
  /* 在子项之间设置间隔 */
}

.date-picker-offset {
  margin: 0;
  padding-left: 0px;
  /* 推动日期选择器向右边移动 */
}

.select-container {
  margin-left: 630px;
  /* 调整左边距以向右移动选择框 */
}

.select-offset {
  margin-left: 0px;
  /* 调整左边距以向右移动选择框 */
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
