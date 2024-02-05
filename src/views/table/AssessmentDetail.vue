<template>
    <div class="app-container">
        <el-table class="custom-table" v-loading="listLoading" :data="tableData" element-loading-text="拼命加载中" border fit
            highlight-current-row stripe table-layout="fixed">
            
            <el-table-column v-for="(value, key) in columns" :key="key" :prop="key"
                :label="typeof value === 'object' ? value.label : value" align="center"
                :fixed="typeof value === 'object' && value.fixed ? value.fixed : false"
                :min-width="typeof value === 'object' && value.minWidth ? value.minWidth : '120'">
                <template v-slot="scope">
                    <!-- 使用 combinedFormatter 方法格式化内容 -->
                    <div :class="{ 'highlight-red': scope.row[key] === '未测评' }">
                        {{ combinedFormatter(scope.row, scope.column, scope.row[key]) }}
                    </div>
                </template>
            </el-table-column>

        </el-table>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import { getDetailByUrl } from '@/api/table';
import fieldLabelMappings from './fieldToLabelMappings';

export default {
    data() {
        return {
            detailData: [],
        };
    },

    created() {
        if (this.currentDetail) {
            const url = this.currentDetail.assessment_detail_url;
            getDetailByUrl(url).then(response => {
                this.detailData = [response.data]; // 将detailData处理为数组形式，以适应tableData的结构
            }).catch(error => {
                console.error("Error fetching detail data:", error);
            });
        }
    },

    computed: {
        ...mapState('table', ['currentDetail']),
        columns() {
            let columns = {};
            // 添加 currentDetail 的固定字段
            if (this.currentDetail) {
                columns = {
                    ...columns,
                    'record_date': '记录日期',
                    'crew_group': '乘务班组',
                    'name': '姓名',
                    'work_certificate_number': '工作证号',
                    'train_model': '车型',
                    'assessment_item': '考核项目',
                    // 以评估结果作为固定列，便于查看测评
                    'assessment_result': { label: '考核结果', fixed: 'left' },
                };
            }
            // 根据 detailData 动态添加字段，且排除 assessment_base 和 id 这两个字段
            if (this.detailData.length > 0) {
                Object.keys(this.detailData[0]).forEach(key => {
                    if (key !== 'assessment_base' && key !== 'id') {
                        const label = fieldLabelMappings[key] || key; // 使用自定义映射表或回退到字段名
                        // 为每个动态字段设置默认最小宽度，特定字段可以设置更大的宽度
                        const minWidth = key === 'some_specific_field' ? '250' : '120'; // 举例，根据需要调整
                        columns[key] = { label: label, minWidth: minWidth, sortable: true };
                    }
                });
            }
            return columns;
        },
        tableData() {
            // 假设只有一行detailData，结合currentDetail展示
            const combinedData = [{ ...this.currentDetail, ...this.detailData[0] }];
            // 处理测评中的空值
            combinedData.forEach(row => {
                Object.keys(row).forEach(key => {
                    if (row[key] === null || row[key] === '') {
                        row[key] = '未测评';
                    }
                });
            });
            return combinedData;
        }
    },

    methods: {
        // 评估结果的格式化
        assessmentResultFormatter(value) {
            switch (value) {
                case 3: return '优秀';
                case 2: return '合格';
                case 1: return '不合格';
                default: return '未知'; // 为了安全起见，添加一个默认返回值
            }
        },
        // 将数据库传来的时间 格式化为 mm:ss.S
        generalFormatter(value) {
            const timeRegex = /^\d{2}:\d{2}:\d{2}\.\d+$/;
            if (timeRegex.test(value)) {
                // 如果匹配时间格式，则进行相应的格式化
                return value.replace(/^00:/, '').replace(/\.(\d)\d*$/, '.$1');
            }
            // 对于其他类型的值，直接返回原值
            return value;
        },
        // 两个函数组合
        combinedFormatter(row, column, cellValue) {
            // 根据列的属性（即column.property）决定使用哪个格式化逻辑
            if (column.property === 'assessment_result') {
                // 如果是评估结果列，使用评估结果格式化函数
                return this.assessmentResultFormatter(cellValue);
            } else {
                // 对于其他列，使用通用格式化函数
                return this.generalFormatter(cellValue);
            }
        },
    },
};

</script>
<style scoped>
.app-container {
    padding: 20px;
}

.highlight-red {
    background-color: #ffebee; /* 浅红色背景 */
    color: #d32f2f; /* 深红色文本，以确保对比度和可读性 */
    padding: 4px 4px; /* 添加一些内边距 */
    border-radius: 4px; /* 圆角边框 */
    border: 1px solid #f44336; /* 红色边框 */
    font-weight: bold; /* 加粗字体增加突出效果 */
    text-align: center; /* 文本居中显示 */
}

</style>