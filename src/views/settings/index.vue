<template>
    <div class="classification-container">
        <!-- 顶部展现文件选项 -->
        <h2 style="text-align: center;">步骤归类</h2>
        <div class="file-names-container">
            <div class="file-name-item" v-for="fileName in uniqueFileNames" :key="fileName"
                @click="selectFileName(fileName)">
                <h2>{{ fileName }}</h2>
            </div>
        </div>
        <div v-if="uniqueFileNames.length === 0" class="no-data">无数据</div>

        <!-- 展示字段并保存分类到数据库中 -->
        <div v-if="selectedFileName" class="additional-data-container">
            <h3>为文件名 {{ selectedFileName }} 的操作分类:</h3>
            <div class="data-container">
                <div class="data-item" v-for="key in Object.keys(selectedAdditionalData)" :key="key">
                    <div>{{ key }}</div>
                    <el-select v-model="classifications[key]" placeholder="请选择操作分类">
                        <el-option label="识故" value="识故"></el-option>
                        <el-option label="排故" value="排故"></el-option>
                        <el-option label="操作确认" value="操作确认"></el-option>
                    </el-select>
                </div>
            </div>
            <!-- 保存分类的按钮 -->
            <div class="button-container">
                <el-button type="primary" @click="saveClassifications" :disabled="!isAllClassified" :loading="loading"
                    size="big">
                    保存分类
                    <i class="el-icon-check el-icon--right"></i>
                </el-button>
            </div>
        </div>

    </div>
</template>

<script>
import { AllTrainingData } from '@/api/table';
import { SaveClassification, fetchDataCategories } from '@/api/settings';

export default {
    name: 'AssessmentClassification',
    data() {
        return {
            assessments: [],
            uniqueFileNames: [],
            selectedFileName: '',
            selectedAdditionalData: {},
            classifications: {},
            loading: false,
            dataCategories: {}, // 存储从接口获取的分类数据
        };
    },

    mounted() {
        this.fetchAllData();
        this.fetchDataCategories(); // 获取分类数据
    },

    computed: {
        // 检查所有分类是否都已经选择
        isAllClassified() {
            return Object.values(this.classifications).every(value => value !== '');
        },
    },

    methods: {
        // 获取所有数据
        fetchAllData() {
            AllTrainingData().then(response => {
                this.assessments = response.data;
                this.extractUniqueFileNames();
            }).catch(error => {
                console.error("Error fetching data: ", error);
            });
        },

        // 获取分类数据
        fetchDataCategories() {
            fetchDataCategories().then(response => {
                // 假设response.data是上面提到的数据格式
                const categories = response.data;

                // 转换数据格式以便易于访问，将其转换为以文件名为键的对象
                this.dataCategories = categories.reduce((acc, item) => {
                    acc[item.file_name] = item.classifications;
                    return acc;
                }, {});
            }).catch(error => {
                console.error("Error fetching data categories: ", error);
            });
        },

        // 展示唯一的文件名
        extractUniqueFileNames() {
            // 使用Set来存储唯一获取到的assessments中的 文件名 字段
            const fileNames = new Set(this.assessments.map(item => item.file_name));
            // 使用Array.from将Set转换为数组，然后将其赋值给uniqueFileNames，展示唯一的文件名
            this.uniqueFileNames = Array.from(fileNames);
        },

        // 获取用户点击的fileName
        selectFileName(fileName) {
            this.selectedFileName = fileName;
            const selectedAssessment = this.assessments.find(item => item.file_name === fileName);
            if (selectedAssessment && selectedAssessment.additional_data) {
                const dataEntries = Object.entries(selectedAssessment.additional_data).slice(2);
                this.selectedAdditionalData = dataEntries.reduce((acc, [key, value]) => {
                    acc[key] = value;
                    return acc;
                }, {});
            } else {
                this.selectedAdditionalData = {};
            }
            // 初始化classifications
            this.initializeClassifications();

            // 新增：根据dataCategories和selectedFileName来填充classifications
            this.fillClassificationsFromDataCategories();
        },

        // 初始化分类
        initializeClassifications() {
            this.classifications = {};
            Object.keys(this.selectedAdditionalData).forEach(key => {
                this.$set(this.classifications, key, '');
            });
        },

        // 新增一个方法来填充classifications
        fillClassificationsFromDataCategories() {
            if (this.dataCategories[this.selectedFileName]) {
                const classificationsData = this.dataCategories[this.selectedFileName];
                Object.keys(this.selectedAdditionalData).forEach(key => {
                    // 检查dataCategories中是否有对应的分类信息
                    if (classificationsData[key]) {
                        // 直接使用从dataCategories获取的分类信息来更新classifications
                        this.classifications[key] = classificationsData[key];
                    }
                });
            }
        },

        // 调用保存分类信息
        async saveClassifications() {
            // 如果没有选择所有分类，展示错误信息
            if (!this.isAllClassified) {
                this.$message.error({
                    message: '所有字段都必须分类，请完成分类后再保存。',
                    duration: 2000,
                    showClose: true
                });
                return;
            }

            this.loading = true; // 开始加载

            try {
                await SaveClassification({
                    file_name: this.selectedFileName,
                    classifications: this.classifications
                });
                this.$message({
                    type: 'success',
                    message: '分类信息已保存',
                    duration: 2000,
                    showClose: true
                });
            } catch (error) {
                console.error("Error saving classifications: ", error);
            } finally {
                this.loading = false; // 无论操作成功还是失败，都在button上停止加载
            }
        },

    },
};
</script>

<style scoped>
.file-names-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
    margin-bottom: 20px;
}

.file-name-item {
    cursor: pointer;
    padding: 10px;
    border: 2px solid #eee;
    border-radius: 4px;
    transition: transform 0.3s ease;
}

.file-name-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.no-data {
    text-align: center;
    margin-top: 20px;
}

.additional-data-container {
    padding: 20px;
}

.data-container {
    display: flex;
    /* 使用flex布局 */
    flex-wrap: wrap;
    /* 允许换行 */
    gap: 20px;
    /* 项目之间的间隔 */
}

.data-item {
    min-width: 300px;
    /* 保留这个设置以确保最小宽度 */
    margin-bottom: 20px;
    padding: 10px;
    display: flex;
    /* 添加flex布局来更好地控制子元素 */
    flex-direction: column;
    /* 使子元素垂直排列 */
}

.data-item>div {
    width: 100%;
    /* 使key字段和el-select的宽度相同 */
    margin-bottom: 10px;
    /* 在key字段和el-select框之间添加10px的间距 */
}

.button-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}
</style>