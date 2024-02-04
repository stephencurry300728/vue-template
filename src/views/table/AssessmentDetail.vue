<template>
    <div>
        1
        <!-- 使用detailData显示详情信息 -->
    </div>
</template>

<script>
import { mapState } from 'vuex';
import { getDetailByUrl } from '@/api/table'

export default {
    computed: {
        // 从Vuex获取detailUrl状态
        ...mapState('table', ['detailUrl']),
    },
    data() {
        return {
            detailData: [],
        };
    },
    created() {
        this.loadDetail();
    },
    methods: {
        loadDetail() {
            // 直接使用从Vuex获取的detailUrl
            const url = this.detailUrl;
            getDetailByUrl(url).then(response => {
                console.log(response);
                this.detailData = response.data;
            }).catch(error => {
                console.error("Error fetching detail data:", error);
            });
        }
    }
};
</script>

<style></style>