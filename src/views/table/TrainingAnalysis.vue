<template>
    <div class="container">

        <h2 style="margin-left: 20px;">一、 培训概况</h2>
        <el-card v-if="trainingAnalysisData && trainingAnalysisData.length > 0" class="box-card">

            <div class="text-center">
                <span class="training-line"> {{ processedData.lineNames }}</span>
                共计参加 <span class="training-items">{{ processedData.trainingItems }}</span>
                培训人数为：<span class="total-count">{{ processedData.totalCount }}</span>人
                合格率：<span class="pass-rate">{{ processedData.passRate }}%</span>
            </div>

            <div class="tableData">
                <el-table :data="tableData" fit element-loading-text="拼命加载中" border stripe>
                    <el-table-column prop="crew_group" label="班组" width="180" align="center"></el-table-column>
                    <el-table-column prop="count" label="人数" align="center"></el-table-column>
                    <el-table-column prop="excellent" label="优秀" align="center"></el-table-column>
                    <el-table-column prop="qualified" label="合格" align="center"></el-table-column>
                    <el-table-column prop="unqualified" label="不合格" align="center"></el-table-column>
                </el-table>
            </div>

        </el-card>
        <div v-else class="no-data">
            无培训数据
        </div>

        <h2 style="margin-left: 20px;">二、 问题分析</h2>
        <!-- 验证哪些文件未设定步骤 -->
        <div v-if="missingFileNames.length > 0" class="no-data-info">
            <p>
                文件名： {{ missingFileNames.join('，') }} 缺少步骤归类！
                请<a href="#" @click.prevent="goToSettings">点击这里</a>去为其设置步骤归类
            </p>
        </div>

        <!-- 第二张表格的数据 -->
        <div class="tableData">
            <el-card class="box-card" v-if="!allPercentagesZero">
                <el-table :data="flattenedIssues" border stripe :span-method="spanMethod">
                    <el-table-column prop="group" label="步骤归类" align="center" width="220">
                        <template v-slot="{ row }">
                            <span v-if="row.rowspan">{{ row.group }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="classification" label="详情操作" align="center"></el-table-column>
                    <el-table-column prop="percentage" label="错误占比" align="center">
                        <template slot-scope="scope">
                            {{ scope.row.percentage }}
                        </template>
                    </el-table-column>
                </el-table>
            </el-card>
        </div>

    </div>
</template>

<script>
import { mapState } from 'vuex';
import { fetchCategories } from '@/api/settings';

export default {
    name: 'TrainingAnalysis',

    data() {
        return {
            categories: [],
        };
    },

    mounted() {
        this.fetchDataCategories();
    },

    computed: {
        // 从 store 中获取筛选后的培训数据
        ...mapState('table', [
            'trainingAnalysisData',
        ]),

        // 培训数据的总计合格率概况
        processedData() {
            // 检查 trainingAnalysisData 是否存在或是否为空数组
            if (!this.trainingAnalysisData || this.trainingAnalysisData.length === 0) {
                // 如果不存在或为空数组，返回默认值
                return { lineNames: '', totalCount: 0, passRate: 0, trainingItems: '' };
            }

            const data = this.trainingAnalysisData;
            // 使用 map 方法从 data 数组中提取出每个元素的 trainLines 属性，生成一个新的数组
            // new Set() 是创建一个新的 Set 对象。Set 是一种特殊的数据结构，它只存储唯一的值，重复的值会被忽略
            // sort() 方法是对数组进行排序，最后返回的是['09', '10']
            const trainLines = [...new Set(data.map(item => item.trainLines))].sort();
            // 获取培训总人数
            const totalCount = data.length;
            // 通过筛选出 assessment_result 为 2(合格) 或 3(优秀) 的项，统计为合格人数
            const passCount = data.filter(item => item.assessment_result === 2 || item.assessment_result === 3).length;
            // 计算合格率
            const passRate = ((passCount / totalCount) * 100).toFixed(2);

            // 将线路的值转换为中文
            const lineNames = trainLines.map(line => {
                switch (line) {
                    case '01': return '1号线';
                    case '05': return '5号线';
                    case '09': return '9号线';
                    case '10': return '10号线';
                    default: return `${line}号线`;
                }
            }).join(' / ');

            // 组合 train_model 和 assessment_item，并去除重复的组合
            // 将科目连接成一个字符串并用，分隔展示不同考核项目
            const trainingItems = [...new Set(data.map(item => `${item.train_model}-${item.assessment_item}`))].join('， ');

            return { lineNames, totalCount, passRate, trainingItems };
        },

        // 表格数据展示不同乘务班组的合格信息
        tableData() {
            // 首先检查是否有 trainingAnalysisData 数据，如果没有或为空数组，则直接返回一个空数组
            if (!this.trainingAnalysisData || this.trainingAnalysisData.length === 0) {
                return [];
            }

            // 使用 reduce 方法遍历 trainingAnalysisData 数组，构建一个以 crew_group（乘务班组） 为键，统计信息为值的对象
            const groupStats = this.trainingAnalysisData.reduce((acc, item) => {
                // 检查累加器对象（acc）中是否已经有当前项的 crew_group 作为键的对象
                // 如果没有，则初始化该 crew_group 的统计信息对象，包括人数（count）、优秀（excellent）、合格（qualified）、不合格（unqualified）计数
                if (!acc[item.crew_group]) {
                    acc[item.crew_group] = { count: 0, excellent: 0, qualified: 0, unqualified: 0 };
                }
                // 无论是否新建，都对当前 crew_group 的总人数进行累加
                acc[item.crew_group].count++;
                // 根据 assessment_result 的值，更新对应的优秀、合格或不合格计数
                if (item.assessment_result === 3) {
                    acc[item.crew_group].excellent++;
                } else if (item.assessment_result === 2) {
                    acc[item.crew_group].qualified++;
                } else if (item.assessment_result === 1) {
                    acc[item.crew_group].unqualified++;
                }
                // 返回累加器对象，以便在下一次迭代中使用
                return acc;
            }, {});

            // 将 groupStats 对象转换为数组，每个元素对应一个 crew_group 的统计信息
            // Object.keys(groupStats) 生成一个包含所有 crew_group 键的数组
            // map 方法遍历这个键数组，为每个 crew_group 构建一个包含统计信息的新对象，最后的百分比保留两位小数
            return Object.keys(groupStats).map(group => ({
                // 乘务班组
                crew_group: group,
                // 人数总数
                count: groupStats[group].count,
                // 优秀的总数（百分比）
                excellent: `${groupStats[group].excellent} (${((groupStats[group].excellent / groupStats[group].count) * 100).toFixed(2)}%)`,
                // 合格的总数（百分比）
                qualified: `${groupStats[group].qualified} (${((groupStats[group].qualified / groupStats[group].count) * 100).toFixed(2)}%)`,
                // 不合格的总数（百分比）
                unqualified: `${groupStats[group].unqualified} (${((groupStats[group].unqualified / groupStats[group].count) * 100).toFixed(2)}%)`,
            }));
        },

        // 问题分析
        issueAnalysis() {
            let totalNulls = 0;
            let issueCountsByGroup = {};

            const validFileNames = new Set(this.categories.map(category => category.file_name));

            /*
            categories:[{"file_name":"9tsm2.csv",
            "classifications":{"解锁逃生门红色手柄":"操作问题","复位扭杆":"操作问题",……}}]
            */
            this.categories.forEach(category => {
                Object.values(category.classifications).forEach(group => {
                    if (!issueCountsByGroup[group]) {
                        issueCountsByGroup[group] = { nullCount: 0, total: 0, classifications: {} };
                    }
                });
            });

            /*
            trainingAnalysisData:{……,"file_name":"9tsm2.csv",
            "additional_data":{……,"解锁逃生门红色手柄":"00:02.8","复位扭杆":null,"取下蝴蝶销":null,"复位蝴蝶销":null,……}}
            */
            this.trainingAnalysisData.forEach(dataItem => {
                if (!validFileNames.has(dataItem.file_name)) {
                    return;
                }

                Object.entries(dataItem.additional_data).forEach(([key, value]) => {
                    const group = this.categories.flatMap(category => Object.entries(category.classifications)
                        .filter(([classificationKey, _]) => classificationKey === key)
                        .map(([_, groupValue]) => groupValue))
                        .find(Boolean);

                    if (value === null) {
                        totalNulls++;
                        if (group && issueCountsByGroup[group]) {
                            issueCountsByGroup[group].nullCount++;
                        }
                    }

                    if (group && issueCountsByGroup[group]) {
                        issueCountsByGroup[group].total++;
                        if (!issueCountsByGroup[group].classifications[key]) {
                            issueCountsByGroup[group].classifications[key] = { nullCount: 0, total: 1 };
                        } else {
                            issueCountsByGroup[group].classifications[key].total++;
                        }

                        if (value === null) {
                            issueCountsByGroup[group].classifications[key].nullCount++;
                        }
                    }
                });
            });

            Object.values(issueCountsByGroup).forEach(group => {
                group.percentage = `${((group.nullCount / totalNulls) * 100).toFixed(2)}%`;
                group.classifications = Object.entries(group.classifications).reduce((acc, [key, value]) => {
                    acc[key] = {
                        classification: key,
                        ...value,
                        display: `${value.nullCount}人 (${((value.nullCount / totalNulls) * 100).toFixed(2)}%)`
                    };
                    return acc;
                }, {});
            });

            return issueCountsByGroup;
        },

        // 展开问题分析数据
        flattenedIssues() {
            const issueAnalysis = this.issueAnalysis;
            let flatIssues = [];

            Object.entries(issueAnalysis).forEach(([group, data]) => {
                Object.values(data.classifications).forEach((detail, index) => {
                    if (index === 0) {
                        flatIssues.push({
                            group: `${group} (${data.percentage})`,
                            classification: detail.classification,
                            percentage: detail.display,
                            rowspan: Object.values(data.classifications).length,
                        });
                    } else {
                        flatIssues.push({
                            group,
                            classification: detail.classification,
                            percentage: detail.display,
                            rowspan: 0,
                        });
                    }
                });
            });

            return flatIssues;
        },

        missingFileNames() {
            // 确保每个 trainingAnalysisData 中的 file_name 都在 categories 中有匹配
            const allFileNamesInTrainingData = new Set(this.trainingAnalysisData.map(data => data.file_name));
            const allFileNamesInCategories = new Set(this.categories.map(category => category.file_name));

            // 找出 trainingAnalysisData 中存在，但在 categories 中不存在的 file_name
            let missingFileNames = [...allFileNamesInTrainingData].filter(fileName => !allFileNamesInCategories.has(fileName));

            // 对 missingFileNames 进行排序
            missingFileNames = missingFileNames.sort((a, b) => {
                // 分离数字和文本部分
                const matchA = a.match(/(\d+)([a-zA-Z]+)(\d*)/);
                const matchB = b.match(/(\d+)([a-zA-Z]+)(\d*)/);

                // 比较主要数字部分
                const numA = parseInt(matchA[1], 10);
                const numB = parseInt(matchB[1], 10);

                if (numA !== numB) {
                    return numA - numB;
                }

                // 如果主要数字部分相同，比较文本部分
                if (matchA[2] !== matchB[2]) {
                    return matchA[2].localeCompare(matchB[2]);
                }

                // 如果文本部分也相同，比较次要数字部分
                const subNumA = matchA[3] ? parseInt(matchA[3], 10) : 0;
                const subNumB = matchB[3] ? parseInt(matchB[3], 10) : 0;

                return subNumA - subNumB;
            });

            return missingFileNames;
        },

        // 检查是否所有问题分类的百分比都为0
        allPercentagesZero() {
            return this.flattenedIssues.every(issue => parseFloat(issue.percentage) === 0);
        },
    },

    methods: {
        // 获取分类数据
        async fetchDataCategories() {
            try {
                const response = await fetchCategories();
                this.categories = response.data;
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        },

        spanMethod({ row, column, rowIndex, columnIndex }) {
            if (columnIndex === 0) { // 只在第一列应用合并逻辑
                return [row.rowspan, 1];
            }
            return [1, 1];
        },

        goToSettings() {
            this.$router.push({ path: '/settings' });
        },

    },
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
    margin-bottom: 20px;
}

.training-line,
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

.no-data-info {
    padding: 20px;
    background-color: #f2f2f2;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin: 20px 0;
    text-align: center;
}

.no-data-info p {
    margin: 0;
    padding: 0;
    color: #333;
    font-size: 16px;
}

.no-data-info a {
    color: #007bff;
    text-decoration: none;
    font-weight: bold;
}

.no-data-info a:hover {
    text-decoration: underline;
}
</style>

