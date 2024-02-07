<template>
    <div class="container">
        <el-card v-if="trainingAnalysisData && trainingAnalysisData.length > 0" class="box-card">
            <div class="text-center">
                {{ processedData.lineNames }} 共计参加
                <span class="training-items">{{ processedData.trainingItems }}</span> 培训人数为:
                <span class="total-count">{{ processedData.totalCount }}</span>人 合格率:
                <span class="pass-rate">{{ processedData.passRate }}%</span>
            </div>
        </el-card>
        <div v-else class="no-data">
            无培训数据
        </div>
    </div>
</template>


<script>
import { mapState } from 'vuex';

export default {
    data() {
        return {}
    },
    computed: {
        ...mapState('table', [
            'trainingAnalysisData',
        ]),
        processedData() {
            if (!this.trainingAnalysisData || this.trainingAnalysisData.length === 0) {
                return { lineNames: '', totalCount: 0, passRate: 0, trainingItems: '' };
            }

            const data = this.trainingAnalysisData;
            const trainLines = [...new Set(data.map(item => item.train_model.substring(0, 2)))].sort();
            const totalCount = data.length;
            const passCount = data.filter(item => item.assessment_result === 2 || item.assessment_result === 3).length;
            const passRate = ((passCount / totalCount) * 100).toFixed(2);

            const lineNames = trainLines.map(line => {
                switch (line) {
                    case '01': return '1号线';
                    case '05': return '5号线';
                    case '09': return '9号线';
                    case '10': return '10号线';
                    default: return `${line}号线`;
                }
            }).join('/');

            // 新增：组合 train_model 和 assessment_item，并去重
            const trainingItems = [...new Set(data.map(item => `${item.train_model}-${item.assessment_item}`))].join(', ');

            return { lineNames, totalCount, passRate, trainingItems };
        },
    },

    methods: {},
    created() { },
    mounted() { }
}
</script>

<style scoped>
.box-card {
    margin: 20px auto;
    width: 90%;
    /* 或者根据你的布局需求调整 */
}

.text-center {
    text-align: center;
    font-size: 16px;
    color: #333;
}

.training-items,
.total-count,
.pass-rate {
    font-weight: bold;
    color: #010800;
}

.no-data {
    color: #999;
    text-align: center;
    padding: 20px;
}
</style>

