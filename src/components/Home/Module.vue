<template>
    <div class="body-wrap HomePageMonitor">
        <!--内容区域-->
        <div class="content" :style="{'right':rightPanelWidth+marginWidth+'px','margin':marginWidth+'px'}">
            <el-row class="map-row">
                <el-col :span="24" style="height: 100%;width:100%">
                    <div id="HomePageMonitorMapDiv"></div>
                    
                    <div class="locateDiv">
                        <locate-btn :locations="location" v-model="locate" @change="onLocationChange"></locate-btn>
                    </div>

                    <div class="leftPanel">

                        <div class="layerManageICOBtn" v-show="!tcglShow" title="图层管理" @click="onCloseTC">
                            <i class="hideIco fa fa-map-o"></i>
                        </div>

                        <div class="layerManage" v-show="tcglShow">
                            <el-button v-show="nodeData" style="position: absolute;bottom: 0px;right: -88px;" size="mini" type="primary" @click="onLKQueryChange">
                                拉框查询
                            </el-button>
                            <div class="layerManage_Title">
                                <i class="layerManage_Ico fa fa-map-o"></i>
                                图层管理
                                <div class="layerManage_Close" @click="onCloseTC">×</div>
                            </div>
                            <div class="layerManage_Content">
                                <el-tree 
                                    :data="mapOptions" 
                                    show-checkbox 
                                    node-key="id" 
                                    default-expand-all 
                                    :default-checked-keys="checkedLayers"
                                    @check-change="onCheckChange">
                                    <span class="custom-tree-node" slot-scope="{ node, data }">
                                        <span>
                                            <i :class="node.icon"></i>&nbsp;{{ node.label }}
                                                <el-switch
                                                  style="height:10px;width:30px;margin-top: -2px;margin-left:5px;"
                                                  v-if="data.mapType==='vector'"
                                                  title="打开或者关闭查询"
                                                  v-model="data.mapQuery"
                                                  active-color="#13ce66"
                                                  inactive-color="#dcdfe6"
                                                  @change='onQueryStatusChange(data)'>
                                                </el-switch>
                                        </span>              
                                    </span>
                                </el-tree>

                            </div>
                        </div>

                        <div class="hpManageICOBtn" v-show="!cjShow" title="滑坡距离预测" @click="onCloseCJ">
                            <i class="hideIco fa fa-chain-broken"></i>
                        </div>

                        <div class="hpManage" v-show="cjShow">
                            <div class="hpManage_Title">
                                <i class="hpManage_Ico fa fa-chain-broken"></i>
                                滑坡距离预测
                                <div class="layerManage_Close" @click="onCloseCJ">×</div>
                            </div>
                            <div class="hpManage_Content">
                                <el-tabs tab-position="left">
                                    <el-tab-pane label="①公式参照">
                                        <div class="hpManage_Content_Item">滑坡滑距预测理论公式：</div>
                                        <img :src="gsSrc" width=330>
                                        <div class="hpManage_Content_Item2">η：综合能量折减系数</div>
                                        <div class="hpManage_Content_Item2">L1：滑坡体长度</div>
                                        <div class="hpManage_Content_Item2">L2：滑道长度</div>
                                        <div class="hpManage_Content_Item2">θ1：滑面（启动段）与剪出口的夹角</div>
                                        <div class="hpManage_Content_Item2">θ2：滑道（加速段）坡度</div>
                                        <div class="hpManage_Content_Item2">θ3：堆积区下垫面（减速段）坡度</div>

                                        <div class="hpManage_Content_Item2">φ1：启动段综合内摩擦角</div>
                                        <div class="hpManage_Content_Item2">φ2：加速段综合内摩擦角</div>
                                        <div class="hpManage_Content_Item2">φ3：减速段综合内摩擦角</div>

                                        <div class="hpManage_Content_Item2">δ：长度比</div>
                                    </el-tab-pane>
                                    <el-tab-pane label="②参数设定">
                                        <div style="width:100%;float:left;margin:5px 0px;">
                                            参数设定：
                                        </div>
                                        <div style="width:50%;float:left;margin:5px 0px;">
                                            θ3：<el-input style="width:100px;" v-model="paraObj.Q3" placeholder="请输入内容"></el-input>°
                                        </div>
                                        <div style="width:50%;float:left;margin:5px 0px;">
                                            φ1：<el-input style="width:100px;" v-model="paraObj.g1" placeholder="请输入内容"></el-input>°
                                        </div>
                                        <div style="width:50%;float:left;margin:5px 0px;">
                                            φ2：<el-input style="width:100px;" v-model="paraObj.g2" placeholder="请输入内容"></el-input>°
                                        </div>
                                        <div style="width:50%;float:left;margin:5px 0px;">
                                            φ3：<el-input style="width:100px;" v-model="paraObj.g3" placeholder="请输入内容"></el-input>°
                                        </div>
                                    </el-tab-pane>
                                    <el-tab-pane label="③滑距预测">
                                        <div style="margin:15px 0px;text-align: center;">
                                            <el-button type="primary" @click="onSetHDPoint">设置滑动点</el-button>
                                            <el-button type="success" @click="onYCHDPoint">预测滑动距离</el-button>
                                            <el-button type="success" @click="onClear">清除绘图</el-button>
                                        </div>
                                        预测结果
                                        <div style="margin:8px 4px;text-align: center;">
                                            <el-table
                                                :data="tableData"
                                                border
                                                style="width: 100%">
                                                <el-table-column
                                                  align='center'
                                                  prop="L"
                                                  label="L滑距(米)">
                                                </el-table-column>
                                                
                                                <el-table-column
                                                  align='center'
                                                  prop="L1"
                                                  label="L1(米)">
                                                </el-table-column>
                                                <el-table-column
                                                  align='center'
                                                  prop="L2"
                                                  label="L2(米)">
                                                </el-table-column>
                                            </el-table>

                                        </div>

                                        <div style="margin:8px 4px;text-align: center;">
                                            <el-table
                                                :data="tableData"
                                                border
                                                style="width: 100%">

                                                <el-table-column
                                                  align='center'
                                                  prop="Q1"
                                                  label="θ1(°)">
                                                </el-table-column>
                                                <el-table-column
                                                  align='center'
                                                  prop="Q2"
                                                  label="θ2(°)">
                                                </el-table-column>
                                                <el-table-column
                                                  align='center'
                                                  prop="N"
                                                  label="η">
                                                </el-table-column>
                                                <el-table-column
                                                  align='center'
                                                  prop="p"
                                                  label="δ">
                                                </el-table-column>
                                                
                                            </el-table>
                                        </div>

                                        <el-button v-show="isShowExportBtn" style="float:right;margin-right:4px;margin-bottom:4px;" size="mini" type="primary" icon="el-icon-download" @click="onExportExcel">导出</el-button>
                                    </el-tab-pane>
                                </el-tabs>
                                

                            </div>
                        </div>
                    </div>
                    
                    
                </el-col>
            </el-row>
        </div>        
        <!--条件区域-->
        <right-panel class="leftInfoPanel" :rightPanelWidth="rightPanelWidth" :marginWidth="marginWidth" :toggleStatus="toggleStatus" :hasTitle="false" :hasBorder="false" @togglePanel="onTogglePanel">
            <div class="condition-wrap">
                <div class="conditionContainer" ref="condition">
                    
                </div>
            </div>
        </right-panel>
    </div>
</template>  

<script>
    import moduleJs from './Module.js';

    export default moduleJs;
</script>

<style scoped>
    @import url(./assets/style/style.css);
    .body-wrap {
        width: 100%;
        height: 100%;
        font-size: 14px;
    }
    .content {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
    }
    .HomePageMonitor{}
    .HomePageMonitor .condition-wrap {
        position: absolute;
        box-sizing: border-box;
        /*框架里 padding:12px*/
        width: 100%;
        height: 100%;
    }
    .HomePageMonitor .conditionContainer{
        /*框架里condition-wrap padding:12px*/
        position: absolute;
        height: -moz-calc(100% - 24px);
        height: -webkit-calc(100% - 24px);
        height: -o-calc(100% - 24px);
        height: -ms-calc(100% - 24px);
        height: calc(100% - 24px);

       width:100%;
    }
    
   
    .HomePageMonitor .map-row {
        height: 100%;
    }
    #HomePageMonitorMapDiv{
        width: 100%;
        height: 100%;
    }
    
    .HomePageMonitor .leftInfoPanel {
        background-color: #fff !important;
        color: #fff !important;
    }    
    
    .HomePageMonitor .locateDiv{
        position: absolute;
        right: 4px;
        top: 4px;
        z-index: 600;        
    }
   
    .HomePageMonitor .condition-wrap{
        padding:0 !important;
    }


    .leftPanel{
        width:auto;
        height:auto;
        position: absolute;
        left:0px;
        top:8px;
    }

    .hideIco{
        color:#fff;
        margin-left:0px;
        margin-top:8px;
    }

    .layerManageICOBtn{
        width:20px;
        height:30px;
        position: absolute;
        left:0px;
        top:8px;
        background-color: rgb(49, 126, 236);
        z-index: 600; 
        border:1px solid rgb(49, 126, 236);
        cursor: pointer;
    }

    .layerManage{
        width:260px;
        height:320px;
        position: absolute;
        left:8px;
        top:8px;
        background-color: #fff !important;
        z-index: 600; 
        border:1px solid rgb(49, 126, 236);    
    }

    .layerManage_Title{
        height:35px;
        line-height:35px;
        width:100%;
        background-color: rgb(49, 126, 236);
        color:#fff;
    }

    .layerManage_Ico{
        color:#fff;
        margin-left:10px;
        margin-right:10px;
    }

    .layerManage_Close{
        height:100%;
        width:35px;
        line-height:35px;
        text-align: center;
        float:right;
        cursor: pointer;
    }

    .layerManage_Close:hover{
        opacity: 0.7;
    }
    

    .layerManage_Content{
        width:100%;
        height:calc(100% - 45px);
        margin:5px 0px;
    }

    .hpManageICOBtn{
        width:20px;
        height:30px;
        position: absolute;
        left:0px;
        top:340px;
        background-color: rgb(49, 126, 236);
        z-index: 600; 
        border:1px solid rgb(49, 126, 236);
        cursor: pointer;
    }

    .hpManage{
        width:430px;
        height:320px;
        position: absolute;
        left:8px;
        top:340px;
        background-color: #fff !important;
        z-index: 600; 
        border:1px solid rgb(49, 126, 236);    
    }

    .hpManage_Title{
        height:35px;
        line-height:35px;
        width:100%;
        background-color: rgb(49, 126, 236);
        color:#fff;
    }

    .hpManage_Ico{
        color:#fff;
        margin-left:10px;
        margin-right:10px;
    }

    .hpManage_Content{
        width:100%;
        height:calc(100% - 45px);
        margin:5px 0px;
    }

    .hpManage_Content_Item{
        height:20px;
        line-height:20px;
        font-size:9px;
    }

    .hpManage_Content_Item2{
        height:20px;
        line-height:20px;
        font-size:9px;
    }


    
</style>

