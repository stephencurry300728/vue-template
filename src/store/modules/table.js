export default {
    namespaced: true, // 启用命名空间

    state: {
        // 用于存储当前选中的项的详细数据
        currentDetail: null, 
    },

    mutations: {
        // 赋值当前选中的项的详细数据
        setCurrentDetail(state, detail) {
            state.currentDetail = detail;
        },
    },
};
