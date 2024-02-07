<template>
    <div>1</div>
</template>

<script>
import { mapState } from 'vuex';

export default {
    data() {
        return {}
    },
    computed: {
        ...mapState('table', [
            'trainingAnalysisData',
        ]),
    },
    methods: {},
    created() { },
    mounted() { }
}
</script>

<style lang=scss></style>