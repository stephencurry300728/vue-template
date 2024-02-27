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
                <button @click="saveClassifications" class="save-button">保存分类</button>
            </div>
        </div>

    </div>
</template>

<script>
import { AllTrainingData } from '@/api/table';
import { SaveClassification } from '@/api/settings';

export default {
    name: 'AssessmentClassification',
    data() {
        return {
            assessments: [],
            uniqueFileNames: [],
            selectedFileName: '',
            selectedAdditionalData: {},
            classifications: {},
        };
    },

    mounted() {
        this.fetchAllData();
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
            // 使用find方法获取用户点击的fileName对应的assessment
            const selectedAssessment = this.assessments.find(item => item.file_name === fileName);
            // 确保selectedAssessment存在，并且有additional_data
            if (selectedAssessment && selectedAssessment.additional_data) {
                // 使用Object.entries将对象转换为键值对数组，然后使用slice跳过前两个条目
                const dataEntries = Object.entries(selectedAssessment.additional_data).slice(2);
                // 将剩余的条目转换回对象格式
                this.selectedAdditionalData = dataEntries.reduce((acc, [key, value]) => {
                    acc[key] = value;
                    return acc;
                }, {});
            } else {
                this.selectedAdditionalData = {};
            }
            this.initializeClassifications();
        },

        // 初始化分类
        initializeClassifications() {
            this.classifications = {};
            Object.keys(this.selectedAdditionalData).forEach(key => {
                this.$set(this.classifications, key, '');
            });
        },

        // 调用保存分类信息
        async saveClassifications() {
            try {
                await SaveClassification({
                    file_name: this.selectedFileName,
                    classifications: this.classifications
                });
                // 使用this.$message显示成功消息
                this.$message({
                    type: 'success',
                    message: '分类信息已保存',
                    duration: 2000, // 显示时长（毫秒）
                    showClose: true // 显示关闭按钮
                });
            } catch (error) {
                console.error("Error saving classifications: ", error);
                // 使用this.$message显示失败消息
                this.$message.error({
                    message: '保存分类信息失败',
                    duration: 2000, // 显示时长（毫秒）
                    showClose: true // 显示关闭按钮
                });
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
    border: 1px solid #eee;
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
    min-width: 300px; /* 保留这个设置以确保最小宽度 */
    margin-bottom: 20px;
    padding: 10px;
    display: flex; /* 添加flex布局来更好地控制子元素 */
    flex-direction: column; /* 使子元素垂直排列 */
}

.data-item > div {
    width: 100%; /* 使key字段和el-select的宽度相同 */
    margin-bottom: 10px; /* 在key字段和el-select框之间添加10px的间距 */
}

.button-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

.save-button {
    cursor: pointer;
    background-color: #578af8;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
}
</style>