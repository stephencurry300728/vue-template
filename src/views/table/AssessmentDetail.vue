<template>
    <div class="app-container">

        <el-table class="custom-table" v-loading="listLoading" :data="[detailData]" element-loading-text="拼命加载中" border fit
            highlight-current-row stripe table-layout="fixed">
            <!-- 忽略 id 和 file_name 字段 -->
            <el-table-column label="记录日期" prop="record_date" width="120" align="center"></el-table-column>
            <el-table-column label="乘务组" prop="crew_group" width="80" align="center"></el-table-column>
            <el-table-column label="姓名" prop="name" width="100" align="center"></el-table-column>
            <el-table-column label="工作证号" prop="work_certificate_number" width="120" align="center"></el-table-column>
            <el-table-column label="车型" prop="train_model" width="100" align="center"></el-table-column>
            <el-table-column label="考核项目" prop="assessment_item" width="100" align="center"></el-table-column>
            <el-table-column label="评估结果" prop="assessment_result" fixed="left" width="100" align="center">
                <template v-slot:default="scope">
                    {{ assessmentResultFormatter(scope.row.assessment_result) }}
                </template>
            </el-table-column>

            <!-- 为动态生成的列设置宽度可能需要更多逻辑，因为可能需要根据内容动态调整宽度 -->
            <el-table-column v-for="(value, key) in detailData.additional_data" :key="key" :label="key"
                :prop="`additional_data.${key}`" width="130" align="center">
                <template v-slot:default="scope">
                    <div v-if="!scope.row.additional_data[key]" class="highlight-red">未测评</div>
                    <div v-else>{{ scope.row.additional_data[key] }}</div>
                </template>
            </el-table-column>

        </el-table>

    </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
    computed: {
        ...mapState('table', [
            'detailData',
        ]),

        processedData() {
            if (!this.detailData) return [];

            const { file_name, id, additional_data, ...rest } = this.detailData;

            // 将rest对象的键值对转换为数组形式，以便在表格中使用
            const mainDataArray = Object.entries(rest).map(([key, value]) => ({
                key: this.formatKey(key), // 格式化key，使其更易读
                value: key === 'assessment_result' ? this.assessmentResultFormatter(value) : value,
            }));

            return [...mainDataArray, ...this.convertAdditionalData(additional_data)];
        }
    },

    mounted() {
        if (!this.detailData) {
            // 处理数据不存在的情况，比如直接访问URL或数据被清空
            console.log("No detail data available, redirecting or fetching data...");
            // 可以在这里重定向回列表页或者根据需要进行其他操作
        }
    },
    methods: {
        assessmentResultFormatter(value) {
            // 转换评估结果的值为更易读的文本
            switch (value) {
                case 3: return '优秀';
                case 2: return '合格';
                case 1: return '不合格';
                default: return '未知';
            }
        },

        convertAdditionalData(additional_data) {
            // 将additional_data转换为数组形式
            return Object.entries(additional_data).map(([key, value]) => ({
                key, 
                value
            }));
        }
    }
};

</script>
<style scoped>
.app-container {
    padding: 20px;
}

.highlight-red {
    background-color: #ffebee;
    /* 浅红色背景 */
    color: #d32f2f;
    /* 深红色文本，以确保对比度和可读性 */
    padding: 4px 4px;
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
</style>