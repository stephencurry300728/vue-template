<template>
    <div>
        1
        <!-- 使用detailData显示详情信息 -->
    </div>
</template>

<script>
import { mapState } from 'vuex';
import { getDetailByUrl } from '@/api/table';

export default {
    computed: {
        ...mapState('table', ['currentDetail']),
    },
    data() {
        return {
            detailData: [],
        };
    },
    created() {
        if (this.currentDetail) {
            // 引入Vuex中的全部数据 currentDetail，获取里面详情页的 URL
            const url = this.currentDetail.assessment_detail_url;
            getDetailByUrl(url).then(response => {
                console.log(response);
                // 将获取到的详情数据赋值给 detailData
                this.detailData = response.data;
            }).catch(error => {
                console.error("Error fetching detail data:", error);
            });
        }
    },
};
</script>
<style></style>