<template>

	<div class="body-wrap">
		<!--内容区域-->
		<div class="content" :style="{'right':rightPanelWidth+padding+'px','margin':padding+'px'}">

			<el-col :span="24" class='actions-top'>

				<el-form :inline="true" class="demo-form-inline">
					<el-form-item>
						<el-button type="default" @click='onBtnAddOrg'><i class="fa fa-plus-circle" style=""></i>新建组织机构</el-button>
					</el-form-item>
				</el-form>
			</el-col>
			<el-table border style="width: 100%" align='center'
					  :data="org_list">

				<el-table-column
						prop="name"
						label="名称"
						align="center"
						width="150"
						:sortable="true">
				</el-table-column>

				<el-table-column
						prop="description"
						label="说明"
						align="center"
						:sortable="false">
				</el-table-column>


				<el-table-column
						prop="status"
						label="功能权限"
						align="left">
					<template scope="scope">
						<el-tag  v-for="(name,index) in scope.row.access"
								 type="primary"
								 close-transition
								 style="margin: 5px">{{name}}</el-tag>
					</template>
				</el-table-column>

				<el-table-column
						label="操作"
						:width="350"
						align="center"
						:context="_self">
					<template scope='scope'>
						<!--<el-button-->
								<!--type="info"-->
								<!--icon='el-icon-view'-->
								<!--size="mini"-->
								<!--@click='onSelectorg(scope.row)'></el-button>-->
						<el-button
								type="info"
								icon='el-icon-edit'
								size="mini"
								@click='onEditOrg(scope.row)'></el-button>

						<el-button
								type="primary"
								size="mini"
								@click='onBtnSetAccess(scope.row,scope.$index,org_list)'>设置权限
						</el-button>

						<el-button
								   type="danger"
								   size="mini"
								   icon='el-icon-delete'
								   @click='onDeleteOrg(scope.row,scope.$index,org_list)'></el-button>

					</template>
				</el-table-column>
			</el-table>

			<el-dialog title="信息" :visible.sync="dialog.show" size="tiny">
				<el-form style="margin:20px;width:60%;"
						 label-width="100px"
						 :model="dialog.org_info">
					<el-form-item class='edit-form'
								  label="名称:"
								  prop='name'>
						{{dialog.org_info.name}}
					</el-form-item>

					<el-form-item label="说明:">
						{{dialog.org_info.description}}
					</el-form-item>


					<el-form-item label="权限:" class='edit-form'>
						<el-tree
								class="filter-tree"
								default-expand-all
								node-key="path"
								:data="curr_access"
								:props="defaultProps"
						>
						</el-tree>
					</el-form-item>
				</el-form>
				<span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="dialog.show = false">关 闭</el-button>
            </span>
			</el-dialog>

			<el-dialog title="设置权限" :visible.sync="dialog_access.show" size="tiny">
				<el-form style="margin:20px;width:80%"
						 label-width="100px"
						 :model="dialog_access.orginfo">
					<el-form-item class='edit-form'
								  label="名称"
								  prop='name'>
						{{dialog_access.orginfo.name}}
					</el-form-item>
					<el-form-item class='edit-form'
								  label="说明"
								  prop='description'>
						{{dialog_access.orginfo.description}}
					</el-form-item>


					<el-form-item class='edit-form'>
						<el-tree
								class="filter-tree"
								show-checkbox
								default-expand-all
								node-key="access"
								:default-checked-keys="currAccess"
								:data="accesss"
								:props="defaultProps"
								:filter-node-method="filterNode"
								ref="updateAccesss"
						>
						</el-tree>
					</el-form-item>

				</el-form>
				<span slot="footer" class="dialog-footer">
                <el-button @click="dialog_access.show = false">取 消</el-button>
                <el-button type="primary" @click="onResetOrgAccess">确 定</el-button>
            </span>
			</el-dialog>

			<el-dialog :title="isEdit==true?'编辑':'角色'" :visible.sync="dialog_add.show" size="tiny">
				<el-form style="margin:20px;width:80%;"
						 label-width="100px"
						 ref="orgInfo"
						 :rules="rule_data"
						 :model="dialog_add.org_info">
					<el-form-item class='edit-form'
								  label="名称"
								  prop='name'>

						<el-input
								v-model="dialog_add.org_info.name"
								placeholder='名称'></el-input>

					</el-form-item>
					<el-form-item class='edit-form'
								  label="说明"
								  prop='description'>

						<el-input
								v-model="dialog_add.org_info.description"
								placeholder='说明'></el-input>

					</el-form-item>



					<el-form-item class='edit-form' v-if="!isEdit">
						<el-tree
								class="filter-tree"
								show-checkbox
								default-expand-all
								node-key="path"
								:data="accesss"
								:props="defaultProps"
								:filter-node-method="filterNode"

								ref="accesss">
						</el-tree>
					</el-form-item>

				</el-form>
				<span slot="footer" class="dialog-footer">
                <el-button @click="dialog_add.show = false;getList()">取 消</el-button>
                <el-button type="primary" @click="onAddOrg">确 定</el-button>
            </span>
			</el-dialog>
		</div>

	</div>
    <!--<div class="list">-->
        <!---->
    <!--</div>-->
</template>

<script>
	import ModuleJs from './Module.js';
	export default ModuleJs;
</script>
<style scoped lang='css'>

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

	.demo-form-inline {
        display: inline-block;
        float: right;
    }

    .btm-action {
        text-align: center;
    }

    .actions-top {
		/*margin-top: 8px;*/
        height: 46px;
    }

    .pagination {
        display: inline-block;
    }

	.filter-tree{
		height: 250px;
		overflow-y: auto;
	}
</style>
