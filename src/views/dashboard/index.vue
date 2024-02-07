<template>
  <div class="dashboard-container">
    <!-- 使用 Element UI 的栅格布局来安排图表 -->
    <el-row :gutter="20">
      <!-- 现有的图表布局 -->
      <el-col :span="12">
        <el-card>
          <div id="pie-chart" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div id="bar-chart" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <!-- 添加箱线图的容器 -->
      <el-col :span="24">
        <el-card style="margin-top: 20px;">
          <div id="barplot-chart" style="height: 420px;"></div> <!-- 箱线图容器 -->
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { AllTrainingData } from '@/api/table' // 导入获取数据的API
import * as echarts from 'echarts' // 引入ECharts

export default {
  name: 'Dashboard',
  data() {
    return {
      allTrainingData: []
    }
  },
  created() {
    this.getAllTrainingData()
  },
  mounted() {
    this.$nextTick(() => {
      this.initPieChart()
      this.initBarChart()
    })
  },
  methods: {
    async getAllTrainingData() {
      const res = await AllTrainingData()
      this.allTrainingData = res.data
      // 数据加载后重新初始化图表
      this.initPieChart()
      this.initBarChart()
    },

    // 转换数据为饼状图所需的格式
    processPieChartData() {
      const resultDistribution = {}
      this.allTrainingData.forEach(data => {
        const { assessment_item, assessment_result } = data
        if (!resultDistribution[assessment_item]) {
          resultDistribution[assessment_item] = { '1': 0, '2': 0, '3': 0 }
        }
        resultDistribution[assessment_item][assessment_result]++
      })

      return Object.keys(resultDistribution).map(item => ({
        name: item,
        type: 'pie',
        data: Object.keys(resultDistribution[item]).map(key => ({
          value: resultDistribution[item][key],
          name: this.resultName(key)
        }))
      }))
    },
    resultName(key) {
      const names = { '1': '不合格', '2': '合格', '3': '优秀' }
      return names[key]
    },
    initPieChart() {
      const pieChart = echarts.init(document.getElementById('pie-chart'))
      const option = {
        title: {
          text: '考核结果饼状图',
          left: 'center' // 标题居中
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [{
          ...this.processPieChartData()[0], // 
          center: ['50%', '60%'], // 将饼状图居中
          itemStyle: {
            // 定义不同考核结果的配色方案
            color: (params) => {
              const colors = ['#5470C6', '#91CC75', '#EE6666']
              return colors[params.dataIndex % colors.length]
            }
          }
        }]
      }
      pieChart.setOption(option)
    },

    // 柱状图
    processBarChartData() {
      const groupResults = {};
      this.allTrainingData.forEach(({ crew_group, assessment_result }) => {
        // 合并特定的乘务班组名称
        if (['乘务高峰组', '高峰组', '乘务高峰'].includes(crew_group)) {
          crew_group = '乘务高峰组';
        }

        if (!groupResults[crew_group]) {
          groupResults[crew_group] = { '1': 0, '2': 0, '3': 0, };
        }
        assessment_result = assessment_result || 'null';
        groupResults[crew_group][assessment_result]++;
      });

      const categories = Object.keys(groupResults)
        .map(group => ({
          group,
          total: Object.values(groupResults[group]).reduce((acc, val) => acc + val, 0)
        }))
        .sort((a, b) => b.total - a.total) // 降序排序
        .map(item => item.group);

      const series = ['1', '2', '3'].map(result => ({
        name: this.resultName(result),
        type: 'bar',
        stack: '总量',
        data: categories.map(group => groupResults[group][result])
      }));

      return { series, categories };
    },
    initBarChart() {
      const { series, categories } = this.processBarChartData();
      const barChart = echarts.init(document.getElementById('bar-chart'));
      const option = {
        title: {
          text: '各乘务班组考核结果',
          left: 'center' // 标题居中
        },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: {
          data: ['不合格', '合格', '优秀'],
          left: 'right',
          orient: 'vertical'
        },
        xAxis: {
          type: 'category',
          data: categories,
          axisLabel: { interval: 0, rotate: 45 } // 使所有标签显示并倾斜
        },
        yAxis: { type: 'value' },
        series: series
      };
      barChart.setOption(option);
    },

    
  }
}

</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 20px;
  }

  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
