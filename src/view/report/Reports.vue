<template>
    <div id="reports">
        <bread :breadList="breadList"></bread>
        <el-card>
            <div ref="chartRef" class="chart"></div>
        </el-card>
    </div>
</template>

<script>
import _ from 'lodash'
import echarts from 'echarts'
import bread from '../../components/bread/index.vue'
export default {
    name: 'reports',
    components: { bread },
    data() {
        return {
            reportObj: {},
            breadList: ['数据管理', '数据报表'],
        }
    },
    methods: {
        async getRepList() {
            const { data: res } = await this.$http.get('reports/type/1')
            if (res.meta.status !== 200) return this.$message.error('数据获取失败')
            this.reportObj = res.data
        },
        handleChart() {
            const myChart = echarts.init(this.$refs.chartRef)
            const option = {
                title: {
                    text: '用户来源',
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        label: {
                            backgroundColor: '#E9EEF3',
                        },
                    },
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                },
                xAxis: [
                    {
                        boundaryGap: false,
                    },
                ],
                yAxis: [
                    {
                        type: 'value',
                    },
                ],
            }
            // 利用this._.merge可以把两个对象深度合并，Object.assign()合并对象是外层合并
            const result = _.merge(this.reportObj, option)
            myChart.setOption(result)
        },
    },
    created() {
        this.$nextTick(async () => {
            await this.getRepList()
            this.handleChart()
        })
    },
    mounted() {
        // this.timer = setTimeout(() => {
        //     this.handleChart()
        // }, 1000)
    },
    // destroyed() {
    //     window.clearTimeout(this.timer)
    // },
}
</script>

<style lang="less" scoped>
.chart {
    width: 80%;
    height: 400px;
}
</style>
