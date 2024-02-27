import request from '@/utils/request';

export function SaveClassification(data) {
    return request({
        url: '/save-classification/',
        method: 'post',
        data
    });
}