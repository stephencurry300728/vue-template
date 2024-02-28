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
                文件名： {{ missingFileNames.join('，') }} 缺少步骤设定！
                请<a href="#" @click.prevent="goToSettings">点击这里</a>去设置步骤。
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
            // 确保有培训数据和分类数据
            if (!this.trainingAnalysisData || this.trainingAnalysisData.length === 0 || !this.categories || this.categories.length === 0) {
                return [];
            }

            let issueCounts = {};

            // 初始化问题分类统计
            this.categories.forEach(category => {
                if (!issueCounts[category.file_name]) {
                    issueCounts[category.file_name] = { groups: {} };
                }
                Object.entries(category.classifications).forEach(([key, value]) => {
                    if (!issueCounts[category.file_name].groups[value]) {
                        issueCounts[category.file_name].groups[value] = {};
                    }
                    if (!issueCounts[category.file_name].groups[value][key]) {
                        issueCounts[category.file_name].groups[value][key] = { empty: 0, total: 0 };
                    }
                });
            });

            // 统计每个文件名下的分类问题
            this.trainingAnalysisData.forEach(dataItem => {
                // 只处理存在于 categories 中的文件名
                const categoryItem = this.categories.find(category => category.file_name === dataItem.file_name);
                if (categoryItem && issueCounts[categoryItem.file_name]) {
                    Object.keys(categoryItem.classifications).forEach(classification => {
                        const group = categoryItem.classifications[classification];
                        const isValueEmpty = !dataItem.additional_data || !dataItem.additional_data[classification] || dataItem.additional_data[classification] === '';
                        issueCounts[categoryItem.file_name].groups[group][classification].total++;
                        if (isValueEmpty) {
                            issueCounts[categoryItem.file_name].groups[group][classification].empty++;
                        }
                    });
                }
            });

            // 转换统计结果为数组格式，并计算百分比
            let results = [];
            Object.entries(issueCounts).forEach(([file_name, data]) => {
                Object.entries(data.groups).map(([group, classifications]) => {
                    let totalEmpty = 0;
                    let total = 0;
                    let classificationsArray = Object.entries(classifications).map(([classification, counts]) => {
                        totalEmpty += counts.empty;
                        total += counts.total;
                        const percentage = counts.total > 0 ? ((counts.empty / counts.total) * 100).toFixed(2) : 0;
                        return {
                            classification,
                            count: counts.empty,
                            percentage: `${counts.empty}人 (${percentage}%)`,
                            rawPercentage: parseFloat(percentage)
                        };
                    });

                    classificationsArray.sort((a, b) => b.rawPercentage - a.rawPercentage);

                    const groupPercentage = total > 0 ? ((totalEmpty / total) * 100).toFixed(2) : 0;
                    results.push({
                        file_name,
                        group,
                        totalEmpty,
                        total,
                        groupPercentage: `(${groupPercentage}%)`,
                        classifications: classificationsArray
                    });
                });
            });

            // 过滤掉所有百分比为0的结果
            return results.filter(result => result.totalEmpty > 0);
        },


        // 展开问题分析数据
        flattenedIssues() {
            const issueAnalysis = this.issueAnalysis;
            let flatIssues = [];
            issueAnalysis.forEach(group => {
                group.classifications.forEach((classification, index) => {
                    if (index === 0) { // 只在大类的第一行添加总空值占比
                        flatIssues.push({
                            group: `${group.group} ${group.groupPercentage}`, // 总空值百分比
                            classification: classification.classification,
                            count: classification.count,
                            percentage: classification.percentage,
                            rowspan: group.classifications.length,
                        });
                    } else {
                        flatIssues.push({
                            group: group.group,
                            classification: classification.classification,
                            count: classification.count,
                            percentage: classification.percentage,
                            rowspan: 0, // 非第一行不显示大类名称和百分比
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
            const missingFileNames = [...allFileNamesInTrainingData].filter(fileName => !allFileNamesInCategories.has(fileName));

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

.table-card {
    margin-top: 20px;
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

