<template>
    <!--条件区域-->
    <div id="right-panel" class="right-panel"
         :style="{border:hasBorder?'1px solid #d9dee5':'none',width:rightPanelWidth+'px',top:marginWidth+'px',right:marginWidth+'px',bottom:marginWidth+'px'}">
        <div class="topPanel" v-if="hasTitle">

            <!--<div class="toggleBtn" v-if="toggle" @click="toggleMenu">-->
                <!--<i :class='[{"el-icon-arrow-left":status==="close"},{"el-icon-arrow-right":status==="open"}]'></i>-->
            <!--</div>-->
            <div class="panelTitle">
                <i class="fa fa-cog fa-fw"></i>
                条件选择
                <div class="toggleBtn" v-if="toggle&&status==='open'" @click="toggleMenu" title="隐藏条件面板">
                    <i :class='["toggle",{"fa fa-arrow-circle-left":status==="close"},{"fa fa-arrow-circle-right":status==="open"}]'></i>
                </div>
            </div>
        </div>


        <form id="form-content-wrap" class="form-content-wrap" :style="{width:rightPanelWidth+'px'}">
            <el-scrollbar ref="panelElScrollBar" wrapClass="content-wrap" viewClass="view-wrap">
                <div class="content-wrap" :style="{'height':panelHeight+'px'}">
                    <div class="view-wrap">
                        <slot>
                        </slot>
                    </div>
                </div>
            </el-scrollbar>
        </form>

        <div class="toggleOpenBtn" v-if="toggle&&status==='close'" @click="toggleMenu" title="显示条件面板">
            <i :class='["toggleClose",{"fa fa-arrow-circle-left":status==="close"},{"fa fa-arrow-circle-right":status==="open"}]'></i>
        </div>
    </div>


</template>

<script>
    import moduleJs from './RightPanel.js';

    export default moduleJs;
</script>

<style scoped lang="css">

    .right-panel {
        background-color: #fff;
        color: #3d3a38;
        height: auto;
        position: absolute;

        font-size: 13px;
    }

    .topPanel {
        height: 31px;
        width: 100%;
        background-color: #f8f8f8;
        color: #848282;
    }

    .right-panel .toggleBtn {
        cursor: pointer;
        /*margin-top: 7px;*/
        margin-left: 10px;
        display: inline-block;

        position: absolute;
        right: 15px;
    }

    /*.toggle :hover{*/
        /*color:#fff;*/
    /*}*/

    .panelTitle {
        line-height: 31px;
        height: 31px;
        background-color: #efefef;
        color: #000;
    }

    .panelTitle .fa {
        margin-left: 5px;
    }

    i, form {
        margin: 0;
        padding: 0;
        border: 0;
        outline: 0;
        vertical-align: baseline;
    }

    .right-panel .form-content-wrap {
        display: flex;
        -webkit-flex-direction: column;
        flex-direction: column;
        padding: 0;
        overflow: auto;
        height: calc(100% - 34px);
    }

    .toggleOpenBtn{
        margin-left: -13px;
        position: absolute;
        top: 10px;
        width: 23px;
        height: 26px;
        /*padding: 3px 3px 3px 8px;*/
        background-color: rgba(0,0,0,0.3);
        z-index: 999;
        border-bottom-left-radius: 5px;
        border-top-left-radius: 5px;
        cursor: pointer;
        text-align: center;
        line-height: 26px;
    }

    .toggleOpenBtn:hover{
        background-color: rgba(0,0,0,0.8);
        color:#fff;
    }

    .toggleOpenBtn .toggleClose{
    }
</style>

