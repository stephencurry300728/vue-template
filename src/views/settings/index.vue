<template>
    <div class="classification-container">
        <h1>分类 Additional Data</h1>
        <div v-for="fileName in uniqueFileNames" :key="fileName" class="file-name">
            <h2 @click="selectFileName(fileName)">{{ fileName }}</h2>
        </div>
        <div v-if="selectedFileName" class="additional-data-container">
            <h3>为 {{ selectedFileName }} 的 Additional Data 分类:</h3>
            <div v-for="key in Object.keys(selectedAdditionalData)" :key="key" class="data-item">
                <div>{{ key }}</div> <!-- 只展示 key -->
                <select v-model="classifications[key]" class="category-select">
                    <option disabled value="">请选择分类</option>
                    <option value="识故">识故</option>
                    <option value="排故">排故</option>
                    <option value="操作确认">操作确认</option>
                </select>
            </div>
            <button @click="saveClassifications" class="save-button">保存分类</button>
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
            classifications: {}
        };
    },

    mounted() {
        this.fetchAllData();
    },

    methods: {
        fetchAllData() {
            AllTrainingData().then(response => {
                this.assessments = response.data;
                this.extractUniqueFileNames();
            }).catch(error => {
                console.error("Error fetching data: ", error);
            });
        },

        extractUniqueFileNames() {
            const fileNames = new Set(this.assessments.map(item => item.file_name));
            this.uniqueFileNames = Array.from(fileNames);
        },

        selectFileName(fileName) {
            this.selectedFileName = fileName;
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

        initializeClassifications() {
            this.classifications = {};
            Object.keys(this.selectedAdditionalData).forEach(key => {
                this.$set(this.classifications, key, '');
            });
        },

        saveClassifications() {
            SaveClassification({
                file_name: this.selectedFileName,
                classifications: this.classifications
            }).then(() => {
                // 使用this.$message显示成功消息
                this.$message({
                    type: 'success',
                    message: '分类信息已保存',
                    duration: 2000, // 显示时长（毫秒）
                    showClose: true // 显示关闭按钮
                });
            }).catch(error => {
                console.error("Error saving classifications: ", error);
                // 使用this.$message显示失败消息
                this.$message.error({
                    message: '保存分类信息失败',
                    duration: 2000, // 显示时长（毫秒）
                    showClose: true // 显示关闭按钮
                });
            });
        },

    },
};
</script>

<style scoped>
.file-name h2 {
    cursor: pointer;
    color: #42b983;
    /* 示例颜色 */
}

.additional-data-container {
    margin-top: 20px;
}

.data-item {
    margin-bottom: 10px;
}

.category-select {
    margin-left: 10px;
}

.save-button {
    margin-top: 20px;
    cursor: pointer;
    background-color: #42b983;
    /* 示例颜色 */
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
}
</style>