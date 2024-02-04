export default {
    namespaced: true, // 启用命名空间

    // 模块的状态
    state: {
        detailUrl: '' // 用于存储详情页的URL
    },

    // 修改状态的方法
    mutations: {
        // 设置详情页URL的mutation
        setDetailUrl(state, url) {
            state.detailUrl = url;
        }
    },
};
