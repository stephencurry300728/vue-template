import request from '@/utils/request';

export function SaveClassification(data) {
    return request({
        url: '/save-classification/', // 根据实际URL调整
        method: 'post',
        data
    });
}