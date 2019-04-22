<template>
    <div class="container">
        <el-col :span="16">
            <highcharts :options="chartOptions"></highcharts>
        </el-col>
        <el-col :span="8">
            <div class="per">
                <span>涨幅：</span>
                <span>{{ per + '%' }}</span>
            </div>
            <el-table :data="tableData">
                <el-table-column label="什么1" prop="p"></el-table-column>
                <el-table-column label="什么2" prop="v"></el-table-column>
            </el-table>
        </el-col>
    </div>
</template>

<script>
    import { remote } from 'electron';
    import { BASE_URL } from '@/config'
    import axios from 'axios';
    import Highcharts from 'highcharts';

    export default {
        data () {
            return {
                currentRq: null,
                // 当前鼠标hover的条目序号
                currentIdx: '',
                tableData: [],
                per: '',
                chartOptions: {
                    chart: {
                        zoomType: 'x',
                        height: '550'
                    },
                    title: {
                        text: '分时图'
                    },
                    subtitle: {
                        text: document.ontouchstart === undefined ?
                            '鼠标拖动可以进行缩放' : '手势操作进行缩放'
                    },
                    xAxis: {
                        type: 'datetime',
                        dateTimeLabelFormats: {
                            millisecond: '%H:%M:%S.%L',
                            second: '%H:%M:%S',
                            minute: '%H:%M',
                            hour: '%H:%M',
                            day: '%m-%d',
                            week: '%m-%d',
                            month: '%Y-%m',
                            year: '%Y'
                        }
                    },
                    tooltip: {
                        dateTimeLabelFormats: {
                            millisecond: '%H:%M:%S.%L',
                            second: '%H:%M:%S',
                            minute: '%H:%M',
                            hour: '%H:%M',
                            day: '%Y-%m-%d',
                            week: '%m-%d',
                            month: '%Y-%m',
                            year: '%Y'
                        }
                    },
                    yAxis: {
                        title: {
                            text: '价格？'
                        }
                    },
                    legend: {
                        enabled: false
                    },
                    plotOptions: {
                        area: {
                            fillColor: {
                                linearGradient: {
                                    x1: 0,
                                    y1: 0,
                                    x2: 0,
                                    y2: 1
                                },
                                stops: [
                                    [0, Highcharts.getOptions().colors[0]],
                                    [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                                ]
                            },
                            marker: {
                                radius: 2
                            },
                            lineWidth: 1,
                            states: {
                                hover: {
                                    lineWidth: 1
                                }
                            },
                            threshold: null
                        }
                    },
                    series: [{
                        type: 'area',
                        name: '价格？',
                        data: []
                    }]
                }
            }
        },
        mounted () {
            console.log("gbchart doc ready.")
            console.log(window.location.href)

            const CancelToken = axios.CancelToken;
            const query = this.$route.query
            let key = query.key || ''
            // key = '600355@a'

            if (this.currentRq) this.currentRq.cancel('request canceled')
            this.currentRq = CancelToken.source()
            axios.get(BASE_URL + "/chart", {
                params: {
                    key: key
                },
                headers: { 'content-type': 'application/json' },
                cancelToken: this.currentRq.token
            }).then(res => {
                return res.data || []
            }).then(data => {
                this.currentRq = null
                const quote = data.quote || {}
                const his = data.his || []
                const tableData = []
                const chartData = []

                for (let i = 1; i <= 5; i++) {
                    tableData.push({
                        p: quote['b' + i + '_p'],
                        v: quote['b' + i + '_v']
                    })
                    tableData.unshift({
                        p: quote['a' + i + '_p'],
                        v: quote['a' + i + '_v']
                    })
                }
                // 表格数据
                this.tableData = tableData

                for (let i in his){
                    chartData.push([his[i].time * 1000, +his[i].price])
                }
                // 图形数据
                this.chartOptions.series[0].data = chartData

                // 涨幅
                this.per = (quote.price - quote.pre_close) / quote.pre_close * 100
            }).catch(err => {
                const { dialog } = remote

                console.log("NOTOK:"+JSON.stringify(err))
                this.currentRq = null
                dialog.showMessageBox({message:"请求失败，请重试",buttons:["OK"]})
            })
        },
        methods: {

        }
    }
</script>

<style lang="scss">
    @import "~@/assets/constant.scss";
    @import "~@/assets/mixins.scss";

    .container {
        .per {
            font-family: $fontsMedium;
            font-size: 16px;
            line-height: 60px;
        }
    }
</style>
