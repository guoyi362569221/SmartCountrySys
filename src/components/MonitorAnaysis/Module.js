
import rightPanel from 'layout/right-panel/RightPanel.vue';
//插件
import {utils} from 'utils/utils';
import {dateUtils} from '@/utils/dateUtils';
import _ from 'lodash';
import echarts from 'echarts';

export default {
    components: {
        'right-panel': rightPanel
    },
    data() {
        return {
            //模块基础数据信息
            name: 'MonitorAnaysis',
            toggleStatus: 'open',
            rightPanelWidth: this.$$appConfig.layout.rightPanel.width,
            toggle: this.$$appConfig.layout.rightPanel.toggle,
            padding: 8,
            isConfigLoaded: false,
            config: {},
            //业务数据
            startTime: new Date(dateUtils.dateToStr("yyyy-MM-dd", dateUtils.dateAdd('d', -30, new Date()))),
            endTime: new Date(),

            pDateOptions: {
                disabledDate(time) {
                    return time.getTime() > Date.now();
                }
            },
            
            checkedChartNodes:[],
            treeCheckedNodes:[],
            treeData: [],
            defaultProps: {
              children: 'children',
              label: 'label'
            },

            charts:[],

            queryNodes:[],

        }
    },
    created() {
        this.rightPanelWidth = this.toggleStatus === "close" ? 0 : this.$$appConfig.layout.rightPanel.width;
        this.$$resize(this.onResize);
        this.$$getConfig(this.onGetConfig);
    },
    methods: {
        /**
         * 获取当前模块配置文件
         * @param config json格式的配置信息
         */
        onGetConfig(config) {
            this.config = config;
            this.isConfigLoaded = true;

            this.checkedChartNodes = utils.deepCopy(config.treeCheckedNodes);
            this.treeCheckedNodes = utils.deepCopy(config.treeCheckedNodes);
            this.treeData = config.treeObjects;

            let that = this;
            this.$nextTick(()=>{
                that.queryMain();
       	    });
        },
        /**
         * 视图大小更改事件
         */
        onResize() {
            console.log('page resize,handle the event at here');
            this.$nextTick(()=>{
                for(let i=0;i<this.charts.length;i++){
                    if (this.charts[i]) {
                        this.charts[i].resize();
                    }
                }
            })
        },

        onStationCheckChange(item, ischeck){
            /////item 是当前选中的对象
            //////ischeck 是选中还是取消
            
            let that = this;
            if(item&&item.children&&item.children.length>0&&that.checkedChartNodes.length==1&&!ischeck){
                let currentCheck = item['id'];
                //最少选中一个节点
                this.$alert("最少可以选1个监测站点！", '警告', {
                    confirmButtonText: '确定',
                    type: 'error'
                });
                that.$refs.stationTree.setChecked(currentCheck, true);
                //this.cityCheckNodes = this.$refs.stationTree.getCheckedNodes(); ////所有的选中
            }

            if(item&&item.children&&item.children.length>0){
               if(ischeck){
                    that.checkedChartNodes.push(item.id);
                    that.queryMain();
                }else{
                    // debugger
                    // _.remove(that.checkedChartNodes, function(n) {  
                    //   return n ==item.id;    //必须写return  
                    // });  
                    // debugger;
                    // that.queryMain();
                    // that.checkedChartNodes = [];
                    for(let i=0;i<that.checkedChartNodes.length;i++){
                        if(that.checkedChartNodes[i]===item.id){
                            that.checkedChartNodes.splice(i,1);
                        }
                    }
                } 
                this.$nextTick(()=>{
                    //that.queryMain();
                })
            }
        },
        
        
        onTimeChange() {
            let that = this;
            this.$nextTick(()=>{
                that.queryMain();
            });
        },
        renderNodeContent(h, {
            node,
            data,
            store
        }) {

           
        },
        
        /**
         * 右边面板状态更改事件
         * @param status 当前状态 open|close
         */

        onTogglePanel(status) {
            this.toggleStatus = status;
            this.rightPanelWidth = status === 'close' ? 0 : this.$$appConfig.layout.rightPanel.width;
        },

        getChartOptions(chartName,legendArray,xAxisArray,seriesArray){
            let option = {
                // title: {
                //     text: chartName
                // },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: legendArray,
                    top:20
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                toolbox: {
                    feature: {
                        saveAsImage: {}
                    }
                },
                xAxis: {
                    type: "category",
                    boundaryGap: true,
                    axisTick: {
                      alignWithLabel: true
                    },
                    splitLine: {
                      show: true
                    },
                    axisLine: {
                      lineStyle: {
                        color: "#000"
                      }
                    },
                    axisLabel: {
                      color: "#000"
                    },
                    data: xAxisArray
                },
                yAxis: {
                    name: chartName,
                    type: "value",
                    scale: true,
                    axisLabel: {
                      color: "#000"
                    },
                    splitLine: {
                      show: true
                    },
                    axisLine: {
                      lineStyle: {
                        color: "#000"
                      }
                    },
                    nameLocation: "end",
                    nameTextStyle: {
                      color: "#000",
                      fontWeight:"bold",
                      fontSize:14
                    }
                },
                series: seriesArray
            }

            return option;
        },

        getTimes(start,end){
            let result = {
                xAxisData: [],
                xAxisDataFullDate: [],
                dataTimeValue:[]
            };
            let dateNumDay = dateUtils.dateDiff("d", start, end) + 1; /////开始时间和结束时间的差
            for (let dt = 0; dt < dateNumDay; dt++) {
                let currentdate = dateUtils.dateAdd("d", dt, start);
                let LabeldateStr = dateUtils.dateToStr("MM.dd", currentdate);
                if (LabeldateStr === "01.01") {
                    LabeldateStr = dateUtils.dateToStr("yyyy-MM-dd", currentdate);
                } else {
                    LabeldateStr = dateUtils.dateToStr("MM月dd日", currentdate);
                }
                result.xAxisData.push(LabeldateStr);
                result.xAxisDataFullDate.push(dateUtils.dateToStr("yyyy年MM月dd日", currentdate));
                result.dataTimeValue.push(dateUtils.dateToStr("yyyy-MM-dd 00:00:00", currentdate));
            }

            return result;
        },

        queryMain(){
            let that = this;

            for(let c=0;c<that.charts.length;c++){
                if (that.charts[c]) {
                    echarts.dispose(that.charts[c]);
                }
            }

            let jcCodes = [];
            let ylCodes = []; 

            that.charts = [];

            let startTimeStr = dateUtils.dateToStr("yyyy-MM-dd 00:00:00", that.startTime);
            let endTimeStr = dateUtils.dateToStr("yyyy-MM-dd 00:00:00", that.endTime);

            let timeObjects = that.getTimes(that.startTime,that.endTime);

            let chartTempData = [];

            that.queryNodes = [];

            for(let k=0;k<that.checkedChartNodes.length;k++){
                for(let i=0;i<this.treeData.length;i++){
                    if(that.checkedChartNodes&&that.checkedChartNodes.length>0&&this.treeData[i]["id"]===that.checkedChartNodes[k]){
                        let children = this.treeData[i]["children"];
                        let chartName = this.treeData[i]["label"];
                        let legendArray = [];
                        let xAxisArray = timeObjects.xAxisDataFullDate;
                        let seriesArray = [];
                        for(let j=0;j<children.length;j++){
                            let legendItem = children[j]["label"];
                            let queryType = children[j]["queryType"];
                            let unit = children[j]["unit"]; 

                            if(j==0){
                                chartName = chartName+"(单位:"+unit+")"
                            }

                            if(queryType!="MonitorYLSJDataQuery"){
                                that.queryNodes.push(children[j]);
                            }
                            

                            let code = children[j]["id"];
                            legendArray.push(legendItem);

                            let seriesItem = {
                                name: children[j]["label"],
                                type: 'line',
                                stack: '总量',
                                data: [],
                                code:code
                            }
                            seriesArray.push(seriesItem);

                            if(queryType==="MonitorYLSJDataQuery"){
                                ylCodes.push(code);
                            }else{
                                jcCodes.push(code); 
                            }
                        }

                        let chartTempItem ={
                            id:this.treeData[i]["id"],
                            chartName:chartName,
                            legendArray:legendArray,
                            xAxisArray:xAxisArray,
                            seriesArray:seriesArray
                        }

                        chartTempData.push(chartTempItem);

                        
                    }
                    
                }
            }

            that.queryData(startTimeStr,endTimeStr,jcCodes,ylCodes,function(data){
                let dataObjs = [];
                if(data.length==2){
                    dataObjs = data[0]["data"].concat(data[1]["data"]);
                }else{
                    dataObjs = data[0]["data"];
                }
                for(let i=0;i<chartTempData.length;i++){
                    for(let j=0;j<chartTempData[i]["seriesArray"].length;j++){
                        let code = chartTempData[i]["seriesArray"][j]["code"];
                        let doData = that.getChartGet(code,timeObjects.dataTimeValue,dataObjs);
                        chartTempData[i]["seriesArray"][j]["data"] = doData;
                    }
                    let chart = echarts.init(document.getElementById(chartTempData[i]["id"]));
                    let chartOption = that.getChartOptions(chartTempData[i]["chartName"],chartTempData[i]["legendArray"],chartTempData[i]["xAxisArray"],chartTempData[i]["seriesArray"])
                    chart.group = "stationGroup";
                    chart.setOption(chartOption, true);
                    that.charts.push(chart);
                }

                echarts.connect("stationGroup");
               
            });
        },

        getCheckedParaNode(){
            let that = this;
            let checkedNodes = that.$refs.stationTree.getCheckedNodes();
            for(let i=0;i<checkedNodes.length;i++){
                if(checkedNodes&&checkedNodes[i]["children"]&&checkedNodes[i]["children"].length>0){
                    that.checkedChartNodes.push(checkedNodes[i]);
                }
            }
        },

        queryData(startTimeStr,endTimeStr,jcCodes,ylCodes,callBack){
            let that = this;

            let requests = [];
            if(jcCodes.length>0){
                let jcParams = {
                    startTimeStr: startTimeStr,
                    endTimeStr: endTimeStr,
                    code: jcCodes.join(",")
                }
                let jcPredictRequest = this.$$MonitorCLSJDataQuery({data: jcParams});
                requests.push(jcPredictRequest);
            }

            if(ylCodes.length>0){
                let ylParams = {
                    startTimeStr: startTimeStr,
                    endTimeStr: endTimeStr,
                    code: ylCodes.join(",")
                }
                let ylPredictRequest = this.$$MonitorYLSJDataQuery({data: ylParams});
                requests.push(ylPredictRequest);
            }
            this.$$promiseAll.call(this, requests, (data) => {
                if(data){
                    if(callBack){
                        callBack(data);
                    }
                }
            });
        },

        getChartGet(code,times,data){
            let that = this;
            let resultArray = [];
            for(let i=0;i<times.length;i++){
                let isHasData = false;
                for(let j=0;j<data.length;j++){
                    if(data[j]["测量日期"].replace("T"," ")===times[i]&&data[j]["产品唯一编号"].replace("T"," ")===code){
                        let zsValue = data[j]["测量值"].toFixed(3);
                        for(let k=0;k<that.queryNodes.length;k++){
                            if(code===that.queryNodes[k]['id']){
                                let temp = data[j]["测量值"];
                                // if(j>0){
                                //     let valueSL = (data[j]["测量值"]-data[j-1]["测量值"])*365;
                                //     zsValue = valueSL.toFixed(3);
                                //     break;
                                // }else{
                                //     zsValue = "-";
                                // }
                                if(that.queryNodes[k]["calc"]){
                                    switch(that.queryNodes[k]["calcObj"]["type"]){
                                        case "dxsw":
                                            zsValue = that.queryNodes[k]["calcObj"]["height"] - (temp - that.queryNodes[k]["calcObj"]["initValue"])*0.1;
                                            break;
                                        break;
                                        case "cxy":
                                            zsValue = 2*that.queryNodes[k]["calcObj"]["height"]*Math.sin(((temp - that.queryNodes[k]["calcObj"]["initValue"])/2)*Math.PI/180)*Math.cos(((temp + that.queryNodes[k]["calcObj"]["initValue"])/2)*Math.PI/180);
                                            break;
                                        break;
                                    }
                                }

                            }
                        }
                        if(typeof zsValue != 'string'){
                            zsValue = zsValue.toFixed(3);
                        }
                        resultArray.push(zsValue);
                        isHasData = true;
                        break;
                    }
                }
                if(!isHasData){
                    resultArray.push("-");
                }
            }
            return resultArray;
        }
    },

    mounted() {

    },

    activated: function () {
        if (this.isConfigLoaded) {
            //todo get data use ajax
        }
        this.onResize();
    },

    deactivated: function () {
    }

}
