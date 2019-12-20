<template>
    <div class="head-nav" :style="{'height':headerHt+'px'}">

        <el-dialog  size="small" :title="dialog.title"
                    :append-to-body=true
                    :visible.sync="dialog.show_pass">
            <el-form style="margin:20px;width:80%;"
                     label-width="100px"

                     :model="dialog.user_info"
                     :rules="dialog.user_info_rules"
                     ref='user_info'>
                <!--<el-form-item class='edit-form'-->
                <!--label="邮箱"-->
                <!--prop='email'>-->
                <!--<el-input v-model="dialog.user_info.Email" disabled placeholder='常用邮箱'></el-input>-->
                <!--</el-form-item>-->
                <el-form-item class='edit-form'
                              label="用户名称"
                              prop='name'>
                    <el-input v-model="dialog.user_info.name" disabled placeholder='用户名'></el-input>
                </el-form-item>
                <el-form-item class='edit-form'
                              label="当前密码"
                              prop='oldPassword'>
                    <el-input
                            type='password'
                            placeholder='当前密码'
                            auto-complete='off'
                            v-model="dialog.user_info.oldPassword"></el-input>
                </el-form-item>
                <el-form-item class='edit-form'
                              label="新密码"
                              prop='newPassword'>
                    <el-input
                            type='password'
                            placeholder='新密码'
                            auto-complete='off'
                            v-model="dialog.user_info.newPassword"></el-input>
                </el-form-item>
                <el-form-item class='edit-form'
                              label="确认密码"
                              prop='password_confirm'>
                    <el-input
                            type='password'
                            placeholder='确认密码'
                            auto-complete='off'
                            v-model="dialog.user_info.password_confirm"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialog.show_pass = false">取 消</el-button>
                <el-button type="primary" @click="updUserPass('user_info')">确 定</el-button>
            </span>
        </el-dialog>


        <div style=";background-color: #317eec"
             :style="{'height':headerHt+'px','line-height':headerHt+'px'}">
            <img class="logoImg" width="47px" height="47px" style="margin-top: 7px; margin-left: 8px" src="../../assets/loginLogo.png"
                 alt="">
            <div style="display: inline-block;margin-right: 80px;height:100%;vertical-align:top;font-size:20px;">甘肃黑方台空天地一体化地质灾害监测平台</div>
            <el-menu v-if='model==="left"'
                     unique-opened router
                     :default-active="$store.state.router.headerCurRouter"
                     :active="$store.state.router.headerCurRouter"
                     mode="horizontal"
                    >
                <template v-for='(item,index) in mainMenu'>
                    <el-submenu v-if="item.name==='更多'"
                                :index="item.path"
                                :key='item.path'
                                :style="{width:menuWidth+'px'}">
                        <template slot="title">
                            <i :class="item.icon  +' icon'"
                               :style="{'color':$store.state.router.headerCurRouter===item.path?'#fff':'inhert'}"></i>
                            {{item.name}}
                        </template>
                        <el-menu-item
                                v-for='(child,cindex) in item.children'
                                :key='child.path'
                                :index='child.path'>
                            <i :class="child.icon  +' icon'"></i>
                            {{child.name}}
                        </el-menu-item>
                    </el-submenu>

                    <el-menu-item
                            v-else
                            :index="item.path"
                            :key='item.path'
                            :style="{width:menuWidth+'px'}">
                        <i :class="item.icon"></i>
                        <span slot="title">{{item.name}}</span>
                    </el-menu-item>

                </template>


            </el-menu>

            <el-menu v-else
                     class="top-menu"
                     unique-opened router
                     :default-active="$store.state.router.leftCurRouter"
                     :active="$store.state.router.headerCurRouter"
                     mode="horizontal">
                <template v-for="(route,index) in mainMenu">
                    <el-submenu :index="route.path"
                                :style="{width:menuWidth+'px'}"
                                v-if="route.children.length>1">

                        <template slot="title">
                            <i :class="route.icon  +' icon'"
                               :style="{'color':$store.state.router.headerCurRouter===route.path?'#fff':'inhert'}"></i>
                            {{route.name}}
                        </template>

                        <template v-for='(child,cindex) in route.children'>
                            <el-submenu
                                    :key='parseRouterUrl(route.path+"/"+child.path)'
                                    :index='parseRouterUrl(route.path+"/"+child.path)'
                                    v-if="child.children&&child.children.length>1">
                                <template slot="title">
                                    <i :class="child.icon  +' icon'"
                                       :style="{'color':$store.state.router.headerCurRouter===child.path?'#fff':'inhert'}"></i>
                                    {{child.name}}
                                </template>

                                <template v-for='(c,cindex) in child.children'>
                                    <el-submenu
                                            :key='parseRouterUrl(route.path+"/"+child.path+"/"+c.path)'
                                            :index='parseRouterUrl(route.path+"/"+child.path+"/"+c.path)'
                                            v-if="c.children&&c.children.length>1">
                                        <template slot="title">
                                            <i :class="c.icon  +' icon'"
                                               :style="{'color':$store.state.router.headerCurRouter===c.path?'#fff':'inhert'}"></i>
                                            {{c.name}}
                                        </template>

                                        <el-menu-item
                                                v-for='(d,cindex) in c.children'
                                                :key='parseRouterUrl(route.path+"/"+child.path+"/"+c.path+"/"+d.path)'
                                                :index='parseRouterUrl(route.path+"/"+child.path+"/"+c.path+"/"+d.path)'>
                                            <i :class="d.icon  +' icon'"></i>
                                            {{d.name}}
                                        </el-menu-item>
                                    </el-submenu>

                                    <el-menu-item
                                            v-else
                                            :key='parseRouterUrl(route.path+"/"+child.path+"/"+c.path)'
                                            :index='parseRouterUrl(route.path+"/"+child.path+"/"+c.path)'>
                                        <i :class="c.icon  +' icon'"></i>
                                        {{c.name}}
                                    </el-menu-item>
                                </template>


                            </el-submenu>


                            <el-menu-item
                                    v-else
                                    :key='parseRouterUrl(route.path+"/"+child.path)'
                                    :index='parseRouterUrl(route.path+"/"+child.path)'>
                                <i :class="child.icon  +' icon'"></i>
                                {{child.name}}
                            </el-menu-item>
                        </template>
                    </el-submenu>


                    <el-menu-item
                            v-else
                            :style="{width:menuWidth+'px'}"
                            :index="route.path"
                            :key='route.path'>
                        <!--<i :class="route.icon"></i>-->
                        <i :class="route.icon +' icon'"></i>
                        {{route.name}}<!-- {{item.path}} -->
                    </el-menu-item>

                </template>
            </el-menu>

            <div class="userInfo" :style="{'top':(headerHt-27)/2+'px'}">
                <div class="userNameDiv">
                    <i class="fa fa-user-circle" style="margin-right: 5px;color:#317eec"></i>
                    <el-dropdown
                            trigger="click"
                            @command='setDialogInfo'>
                            <span class="el-dropdown-link">
                                {{this.$store.state.user.userinfo.un}}<i
                                    class="el-icon-caret-bottom el-icon--right"></i>
                            </span>
                        <el-dropdown-menu slot="dropdown">
                            <!-- <el-dropdown-item command='info'>修改信息</el-dropdown-item> -->
                            <el-dropdown-item
                                    command='pass'
                            >修改密码
                            </el-dropdown-item>
                            <!--<el-dropdown-item-->
                                    <!--command='set'-->
                            <!--&gt;用户设置-->
                            <!--</el-dropdown-item>-->
                            <!--<el-dropdown-item-->
                            <!--command='set'-->
                            <!--v-if='$store.state.user.userinfo.pid==0'>系统设置</el-dropdown-item>-->
                            <el-dropdown-item
                                    command='logout'>退出
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                    <!--  <span> {{$store.state.user.userinfo.un}}</span> -->
                </div>

                <div class="logoutDiv" @click='logout'>
                    <i class="fa fa-power-off logout"></i>
                    <span>退出</span>
                </div>
            </div>
        </div>




        <!--<el-dialog size="small" :title="dialog.title"-->
        <!--v-model="dialog.show_set">-->
        <!--<el-form style="margin:20px;width:80%;"-->
        <!--label-width="100px"-->
        <!--v-model='dialog.set_info'-->
        <!--ref='set_info'>-->
        <!--<el-form-item label="登录方式">-->
        <!--<el-select placeholder="请选择登录方式"-->
        <!--v-model='dialog.set_info.login_style'>-->
        <!--<el-option label="单一登录" value="1"></el-option>-->
        <!--<el-option label="多点登录" value="2"></el-option>-->
        <!--</el-select>-->
        <!--</el-form-item>-->
        <!--<el-form-item label="禁止修改密码">-->
        <!--<el-select placeholder="请选择用户"-->
        <!--multiple-->
        <!--v-model='dialog.set_info.disabled_update_pass'>-->
        <!--&lt;!&ndash; value的值的ID是number，disabled_update_pass的元素中的是字符串，-->
        <!--所以在value上，需要拼装一个空串，来转化-->
        <!--因为elementUI内部用了===-->
        <!--&ndash;&gt;-->
        <!--<el-option-->
        <!--v-for='(user,index) in dialog.set_info.select_users'-->
        <!--:key='index'-->
        <!--:label='user.username'-->
        <!--:value='user.id+""'></el-option>-->
        <!--</el-select>-->
        <!--</el-form-item>-->
        <!--</el-form>-->
        <!--<span slot="footer" class="dialog-footer">-->
        <!--<el-button @click="dialog.show_set = false">取 消</el-button>-->
        <!--<el-button type="primary" @click="onUpdateSetting">确 定</el-button>-->
        <!--</span>-->
        <!--</el-dialog>-->
    </div>
</template>

<script>
    import HeadNavJs from './HeadNav.js';

    export default HeadNavJs;
</script>

<style scoped lang='less'>
    @import url(./assets/style/style.less);

    .icon {
        margin-right: 4px;
        color:#fff;
    }

    .el-menu {
        display: inline-block;
        text-align: center;
    }

    .head-nav {
        width: 100%;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 1001;
        color: #FFF;
        font-size: 14px;
    }

    .userInfo {
        display: inline-block;
        position: absolute;
        right: 10px;
        height: 27px;
        line-height: 27px;
        background: #fff;
        border: 1px solid #3b3e4c;
        border-radius: 13px;
        color: #606266;
    }

    .userInfo > div {
        position: relative;
        display: inline-block;
    }

    .logout {
        text-align: center;
        cursor: pointer;
        margin-right: 5px;
        color:#da3838
    }


    .userNameDiv {
        padding: 0 10px 0 17px;
    }

    .logoutDiv {
        cursor: pointer;
        padding: 0 17px 0 10px;
    }

</style>
