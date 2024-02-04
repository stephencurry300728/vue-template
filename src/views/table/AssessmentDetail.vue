<template>
    <div class="app-container">
        <el-table class="custom-table" v-loading="listLoading" :data="tableData" element-loading-text="拼命加载中" border fit
            highlight-current-row stripe table-layout="fixed">
            <el-table-column v-for="(value, key) in columns" :key="key" :prop="key"
                :label="typeof value === 'object' ? value.label : value" align="center"
                :fixed="typeof value === 'object' && value.fixed ? value.fixed : false"
                :formatter="key === 'assessment_result' ? assessmentResultFormatter : undefined">
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import { getDetailByUrl } from '@/api/table';

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
                    'crew_group': '乘务组',
                    'name': '姓名',
                    'work_certificate_number': '工作证号',
                    'train_model': '列车型号',
                    'assessment_item': '评估项目',
                    // 'assessment_result': '评估结果',
                    'assessment_result': { label: '评估结果', fixed: 'left' },
                };
            }
            // 根据 detailData 动态添加字段，排除 assessment_base 和 id
            if (this.detailData.length > 0) {
                Object.keys(this.detailData[0]).forEach(key => {
                    if (key !== 'assessment_base' && key !== 'id') {
                        // 以字段名作为 label，实际使用时可根据需求进行映射或翻译
                        columns[key] = key;
                    }
                });
            }
            return columns;
        },
        tableData() {
            // 假设只有一行detailData，结合currentDetail展示
            const combinedData = [{ ...this.currentDetail, ...this.detailData[0] }];
            // 处理空值
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
        // 评估结果的格式化方法
        assessmentResultFormatter(row, column, value) {
            switch (value) {
                case 3: return '优秀';
                case 2: return '合格';
                case 1: return '不合格';
                default: return '未知'; // 为了安全起见，添加一个默认返回值
            }
        },
    },
};

</script>
<style scoped>
.app-container {
    padding: 20px;
}
</style>