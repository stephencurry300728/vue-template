<template>
    <div class="upload-container">
        <!-- 文件上传拖拽区域 -->
        <el-upload class="upload-demo" :multiple="true" :before-upload="beforeUpload" :http-request="uploadRequest"
            :show-file-list="false" drag>
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div slot="tip" class="el-upload__tip">*只能上传csv文件*</div>
        </el-upload>
        <!-- 批量文件上传按钮 -->
        <el-button class="upload-button" @click="triggerFileSelect" type="primary"
            icon="el-icon-folder-opened">选择文件上传</el-button>
        <input v-show="false" ref="fileInput" type="file" accept=".csv, text/csv" multiple @change="handleFileUpload" />
        <!-- 文件夹上传按钮 -->
        <el-button class="upload-button" @click="triggerFolderSelect" type="success"
            icon="el-icon-folder">选择文件夹上传</el-button>
        <input v-show="false" ref="folderInput" type="file" webkitdirectory @change="handleFolderUpload" />
    </div>
</template>

<script>
import { uploadFile } from '@/api/upload'
import NProgress from 'nprogress';
import 'nprogress/nprogress.css'; // 引入nprogress样式文件

export default {
    methods: {
        // 上传前的校验是否为csv文件
        beforeUpload(file) {
            const isCsv = file.type === 'text/csv';
            if (!isCsv) {
                this.$message.error('只能上传csv文件！');
                return false;
            }
            return true;
        },
        // 调用API上传批量csv文件
        async uploadRequest(options) {
            NProgress.start(); // 开始显示进度条
            try {
                const response = await uploadFile(options.file);
                let fileNameWithoutExtension = options.file.name.split('.').slice(0, -1).join('.');
                this.$message.success(fileNameWithoutExtension + ' 文件上传成功！');
            } catch (error) {
                console.error('Upload error:', error);
                this.$message.error(fileNameWithoutExtension + '文件上传失败！');
            } finally {
                NProgress.done(); // 完成后隐藏进度条
            }
        },
        // 触发文件选择
        triggerFileSelect() {
            this.$refs.fileInput.click();
        },
        // 处理批量文件上传
        async handleFileUpload(event) {
            const files = event.target.files;
            for (const file of files) {
                // 等待每个文件上传成功后，再进行下一个
                await this.uploadRequest({ file });
            }
        },
        // 触发文件夹选择
        triggerFolderSelect() {
            this.$refs.folderInput.click();
        },
        // 处理文件夹上传
        async handleFolderUpload(event) {
            const files = event.target.files;
            for (const file of files) {
                try {
                    // 等待每个文件上传成功后，再进行下一个
                    console.log('Uploading file from folder:', file.name);
                    await this.uploadRequest({ file });
                } catch (error) {
                    console.error(`Error uploading file ${file.name}:`, error);
                    // 可以选择在这里停止进程，或者继续尝试上传剩下的文件
                }
            }
        }

    }
};
</script>

<style scoped>
.upload-container {
    width: 80%;
    margin: 20px auto;
    text-align: center;
    padding: 50px 0;
    background-color: #f0f2f5;
    /* 轻微调整背景色，增加和谐感 */
}

.upload-demo {
    border: 2px dashed #409EFF;
    border-radius: 10px;
    /* 增加边框圆角 */
    padding: 40px 20px;
    /* 调整内边距以适应增加的圆角和图标大小 */
    text-align: center;
    color: #666;
    background-color: #fff;
    /* 上传区域使用纯白色背景以增强对比 */
    cursor: pointer;
    transition: border-color 0.3s;
    position: relative;
    /* 为了定位图标 */
}

.upload-demo i.el-icon-upload {
    font-size: 48px;
    /* 增大图标大小 */
    color: #409EFF;
    /* 调整图标颜色以强调上传动作 */
    margin-bottom: 20px;
}

.upload-button {
    margin-top: 20px;
    width: auto;
    /* 按钮宽度自适应内容 */
    border-radius: 20px;
    /* 按钮添加圆角 */
    padding: 10px 30px;
    /* 调整按钮内边距 */
    font-size: 16px;
    /* 增大按钮文本大小 */
}

.el-upload__tip {
    color: #f00d0d;
    /* 提示文字使用主色调 */
    font-size: 14px;
    margin-top: 20px;
}

.el-upload__text {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.el-upload__text em {
    color: #e74c3c;
    /* 使用对比色强调“点击上传” */
}

/* 新增的样式，增加一致的元素间距和对齐 */
.upload-container>*+* {
    margin-top: 20px;
}

/* 调整文件和文件夹上传按钮的样式，使其更一致且具有现代感 */
.el-button.upload-button {
    box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.1);
    /* 给按钮添加轻微的阴影 */
    transition: all 0.3s ease;
}

.el-button.upload-button:hover {
    transform: translateY(-2px);
    /* 鼠标悬停时轻微上移，增加交互感 */
    box-shadow: 0 6px 15px 0 rgba(0, 0, 0, 0.15);
}
</style>