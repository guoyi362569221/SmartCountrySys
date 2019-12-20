<template>
	<div class="login"  v-loading="login_actions.disabled">
	
		<div style=""  id="loginBackImg">
			<img  src="../../../static/images/3.jpg"  style="height: 100%;width: 100%;"/>
		</div>
		<div class="MaskDiv" >
			
		</div>
		
		<div  id="loginFrom" >
					
					<el-form  style="text-align: center;" label-position="left" label-width="0px" class="demo-ruleForm card-box loginform"  :element-loading-text="'正在'+(register===true ? '注册' : '登录')+'...'"  :model='data' :rules="rule_data" ref='data'>
							
						<!--<el-form-item prop='name'>-->
							<div class="loginMess" style="" :style="{'margin-top':formOffset.top+'px'}">
								<div class="logo">
									<span class="loginLogo"></span>甘肃黑方台空天地一体化地质灾害监测平台
								</div>
							<el-input  prefix-icon="fa fa-user-o" type="text" auto-complete="off" placeholder="请输入用户名" v-model='data.name'>
								
							</el-input>
							<el-input  prefix-icon="fa fa-lock"  type="password" auto-complete="off" placeholder="密码" v-model='data.password' @keyup.native.enter="onLogin('data',true)"></el-input>
							<el-button   type="primary" :loading="loginBtnLoading" v-if="register===false" @click='onLogin("data")'><i style="margin-left: -2px;" class="fa fa-arrow-right" aria-hidden="true"></i>
							</el-button>
							</div>
						<!--</el-form-item>-->

						<!--<el-form-item prop='password'>
							
						</el-form-item>

						<el-form-item v-if="register===true" prop='repassword'>
							<el-input type="password" auto-complete="off" placeholder="确认密码" v-model='data.repassword' @keyup.native.enter="onRegister('data')"></el-input>
						</el-form-item>

						<el-checkbox style="margin:0px 0px 35px 0px;" v-if="register===false" :checked='remumber.remumber_flag' v-model='remumber.remumber_flag'>记住密码
						</el-checkbox>
						<el-form-item style="width:100%;">
							<el-button type="primary" :loading="loginBtnLoading" v-if="register===false" @click='onLogin("data")'>登录
							</el-button>
							<el-button type="primary" v-if="register===true" @click='onRegister("data")'>注册
							</el-button>
							<el-button @click='resetForm("data")'>重置</el-button>
						</el-form-item>-->
					</el-form>
				
			</div>

		<div class="loginFooter" style="">
			<span>
				监制单位：
			</span>
            <a>甘肃省科学院</a>
            <span class="companySpace">技术支持：</span>
            <a >甘肃省科学院地质自然灾害防治研究所</a>
        </div>
    </div>
</template>

<script>
    import LoginJs from './Login.js';

    export default LoginJs;
</script>
<style scoped lang='css'>
    @import url(./assets/css/style.css);
</style>
<style scoped lang='less'>
    @import url(Login.less);

</style>