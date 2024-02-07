export default {
    namespaced: true, // 启用命名空间

    state: {
        detailData: null, // 用于存储要传递的数据
        trainingAnalysisData: null,
    },
    mutations: {
        setDetailData(state, data) {
            state.detailData = data;
        },
        setTrainingAnalysisData(state, data) {
            state.trainingAnalysisData = data;
        },
    },
    actions: {
        updateDetailData({ commit }, data) {
            commit('setDetailData', data);
        },
        updateTrainingAnalysisData({ commit }, data) {
            commit('setTrainingAnalysisData', data);
        },
    },
};