export default {
    namespaced: true, // 启用命名空间

    state: {
        detailData: null, // 用于存储要传递的数据
    },
    mutations: {
        setDetailData(state, data) {
            state.detailData = data;
        },
    },
    actions: {
        updateDetailData({ commit }, data) {
            commit('setDetailData', data);
        },
    },
};