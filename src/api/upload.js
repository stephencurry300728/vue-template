// 引入axios(axios的二次封装)
import request from '@/utils/request'

// 封装文件上传的API调用
export function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file); // 

    return request({
        url: '/upload-assessment/', // 后端接口地址
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
}
