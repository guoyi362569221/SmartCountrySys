<template>
	<div class="body-wrap MonitorAnaysis">
		<!--内容区域-->
		<div class="content" :style="{'right':rightPanelWidth+'px','margin':padding+'px'}">
			<el-scrollbar style="height:100%; width:100%;" tag="div" wrap-class="title-panel-content" view-class="charts-body" ref="scrollbar">
				<div class="title-panel-content">
					<div class="charts-body" v-for="item in checkedChartNodes" :key="item">
			            <div class="chartsstyle" :id="item">
			            </div>
			        </div>
		        </div>
             </el-scrollbar>
		</div>
		<!--条件区域-->
		<right-panel :rightPanelWidth="rightPanelWidth" :toggleStatus="toggleStatus" @togglePanel="onTogglePanel">
			<!--模块条件区域-->
			<div class="condition-wrap">

				<div class="con-div">
					<span class="con-label">开始时间：</span>
					<div class="con-body">
						<el-date-picker style="width:155px" v-model="startTime" type="date" placeholder="选择日期" :clearable="false" @change="onTimeChange" :picker-options="pDateOptions" default-value="2010-10-01">
						</el-date-picker>
					</div>
				</div>
				<div class="con-div">
					<span class="con-label">结束时间：</span>
					<div class="con-body">
						<el-date-picker style="width:155px" v-model="endTime" type="date" placeholder="选择日期" :clearable="false" @change="onTimeChange" :picker-options="pDateOptions" default-value="2010-10-01">
						</el-date-picker>
					</div>
				</div>
				<div class="con-div">
					<span class="con-label">监测站点：</span>
					<div class="con-body">
						<el-tree
						  id="unSchTree"
						  ref="stationTree" 
						  :data="treeData"
						  show-checkbox
						  node-key="id"
						  @check-change="onStationCheckChange"
						  :default-expanded-keys="treeCheckedNodes"
						  :default-checked-keys="treeCheckedNodes"
						  :props="defaultProps">
						</el-tree>
					</div>
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

	title-panel-content{
        position: relative;
        width: 100%;
        max-height: 100%;
        padding: 11px 0px 0px 0px;
        box-sizing: border-box;
    }

	.charts-body{
        position: relative;
        width: 100%;
        height: 250px;
        box-sizing: border-box;
        margin-bottom: 8px;
        border: 1px solid #d2d5db;
        border-radius: 4px;
        box-shadow: 0px 5px 5px #DDDDDD;
        background-color: white;        
    }

    .chartsstyle{
        position:relative;
        height:100%;
        width: 100%;
    }
	
	

</style>