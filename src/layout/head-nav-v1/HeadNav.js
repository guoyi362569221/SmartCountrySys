import * as sha from 'libs/SHA256.js';
import {utils} from "../../utils/utils";
import 'signalr';

import {
    gbs
} from 'config/';

export default {
    name: 'head-nav-v1',
    data() {
        return {
            headerHt: this.$$appConfig.layout.headerHeight,
            footerHt: this.$$appConfig.layout.footerHeight,
            model: this.$$appConfig.layout.model || 'top',
            menuWidth: 130,
            allMenu: [],
            mainMenu: [],
            moreMenu: [],
            dialog: {
                show_access: false,
                show_set: false,
                show_pass: false,
                title: '修改密码',
                user_info: {
                    name: '',
                    oldPassword: '',
                    newPassword: '',
                    password_confirm: ''
                },

                set_info: {
                    login_style: '',
                    disabled_update_pass: [],
                    select_users: []
                },

                user_info_rules: {
                    oldPassword: [{
                        required: true,
                        message: '旧密码不能为空！',
                        trigger: 'blur'
                    }],
                    newPassword: [{
                        required: true,
                        message: '新密码不能为空！',
                        trigger: 'blur'
                    }, {
                        trigger: 'blur',
                        validator: (rule, value, callback) => {
                            if (value === '') {
                                callback(new Error('请再次输入密码'));
                            } else {
                                if ('' !== this.dialog.user_info.newPassword) {
                                    this.$refs.user_info.validateField('password_confirm');
                                }
                                callback();
                            }
                        }
                    }],
                    password_confirm: [{
                        required: true,
                        message: '确认密码不能为空！',
                        trigger: 'blur'
                    }, {
                        trigger: 'blur',
                        validator: (rule, value, callback) => {
                            if (value === '') {
                                callback(new Error('请再次输入密码'));
                            } else if (value !== this.dialog.user_info.newPassword) {
                                callback(new Error('两次输入密码不一致!'));
                            } else {
                                callback();
                            }
                        }
                    }],
                }
            }
        }
    },

    created() {
        this.allMenu = [];
        let routes = this.$router.options.routes;
        routes.forEach(item => {
            if (!gbs.access && process.env['NODE_ENV'] === 'development') {
                if (!item.hidden) {
                    this.allMenu.push(item)
                }
            }
            else if ((!item.hidden && this.$store.state.user.userinfo.web_routers.indexOf(item.path) > -1) || (item.meta && item.meta.noAccess)) {
                this.allMenu.push(item)
            }
        });
        this.mainMenu = utils.deepCopy(this.allMenu);

        let that = this;
        let webApiUrl = that.$$appConfig.prjInfo.webApi.url;
        if(that.$store.state.user.userinfo.info){
            //$.getScript("http://192.168.1.68/webapi_js/signalr/hubs") 
            $.getScript(webApiUrl + "/signalr/hubs")  
            .done(function() {
                $.support.cors = true;
                $.connection.hub.url = webApiUrl + "/signalr";
                //$.connection.hub.url = "http://192.168.1.68/webapi_js/signalr";
                let pushHub = $.connection.pushHub;
                $.connection.hub.logging = true;

                pushHub.client.notice = function (message) {
                    console.log(JSON.parse(message));
                    that.$root.eventBus.$emit('notice',JSON.parse(message));
                    let data = JSON.parse(message);
                    //如果状态不是doing并且下载人是当前用户才提示
                    if(data&&data.length>0){
                        for(let i=0;i<data.length;i++){
                            if(data[i].status!="doing"&&that.$store.state.user.userinfo.info.name==data[i].creator){
                                switch(data[i].status){
                                    case "sucess":
                                        that.$message({
                                          message: data[i].filename+".pptx,已经处理完成，请下载查看。",
                                          type: 'success'
                                        });
                                    break;
                                    case "error":
                                         that.$message.error(data[i].filename+".pptx,已经处理完成，请下载查看。");
                                    break;
                                }
                                //that.$message(data[i].msg.filename+",已经处理完成，请下载查看。");
                            }
                        }
                    }

                    // let data = JSON.parse(message);
                    // if(data&&data.length>0){
                    //     for(let i=0;i<data.length;i++){
                    //          if(!that.isOnlyShowCurrentUser||(that.isOnlyShowCurrentUser&&that.$store.state.user.userinfo.info.name==data[i].msg.taskcreater)){
                    //              let resultArray = _.filter(that.tableData,function(v){
                    //              return v.id.indexOf(data[i].msg.id)>-1;});
                    //              //1.如果监听到推送消息，则判断该Id的数据是否已经存在，如果不存在则在表中添加该条数据
                    //              if(resultArray.length==0){
                    //                 let obj = data[i].msg;
                    //                 obj.datadate = obj.datadate.replace("T"," ");
                    //                 that.tableData.unshift(obj);
                    //              }else{
                    //                 //2.如果存在则更新数据
                    //                 for(let j=0;j<that.tableData.length;j++){
                    //                     if(that.tableData[j].id==data[i].msg.id){
                    //                         data[i].msg.datadate = data[i].msg.datadate.replace("T"," ");
                    //                         that.tableData[j] = data[i].msg;
                    //                     }
                    //                 }
                    //              }
                    //             //4.推送信息提示
                    //             //如果状态不是doing并且下载人是当前用户才提示
                    //             if(data[i].msg.taskstatus!="doing"&&that.$store.state.user.userinfo.info.name==data[i].msg.taskcreater){
                    //                 switch(data[i].msg.taskstatus){
                    //                     case "sucess":
                    //                         that.$message({
                    //                           message: data[i].msg.filename+",已经处理完成，请下载查看。",
                    //                           type: 'success'
                    //                         });
                    //                     break;
                    //                     case "error":
                    //                          that.$message.error(data[i].msg.filename+",已经处理完成，请下载查看。");
                    //                     break;
                    //                 }
                    //                 //that.$message(data[i].msg.filename+",已经处理完成，请下载查看。");
                    //             }
                    //          }
                    //     }
                    // }
                };

                $.connection.hub.start().done(function () {
                    console.log('Connect success!');
                    pushHub.server.sendLogin(that.$store.state.user.userinfo.info.name);
                }).fail(function (data) {
                    console.log('Could not Connect!');
                });  
            })  
            .fail(function() {  
              /* 靠，马上执行挽救操作 */  
            }); 
        }
    },

    mounted() {

        if (this.$store.state.user.userinfo.info) {
            this.dialog.user_info.name = this.$store.state.user.userinfo.info.name;
        }

        this.$$lib_$(window).resize(() => {
            this.setUI();
        });
    },

    activated() {
        this.setUI();
    },


    methods: {
        setUI() {

            let menuWth = this.menuWidth * this.allMenu.length;
            let wth = this.$$lib_$(window).width();
            let logoWidth = 475;
            let userInfoWidth = this.$$lib_$('.userInfo').width() + 50;

            let realWidth = wth - logoWidth - userInfoWidth;
            if (realWidth >= menuWth) {
                this.mainMenu = utils.deepCopy(this.allMenu);
            }
            else {
                let num = Math.floor(realWidth / this.menuWidth);
                if (num <= 0)
                    this.mainMenu = [];
                else {

                    this.mainMenu = this.allMenu.slice(0, num - 1);
                    this.moreMenu = this.allMenu.slice(num - 1);
                    let children = this.moreMenu.map(item => {
                        return {
                            path: item.path,
                            name: item.name,
                            icon: item.icon,
                            children: item.children || []
                        }
                    });


                    let moreMenuItem = {
                        path: '/',
                        name: '更多',
                        icon: 'icon-3clear-radar-c',
                        children: []
                    };
                    moreMenuItem.children = children;
                    this.mainMenu.push(moreMenuItem);
                }
            }

        },

        parseRouterUrl(url) {
            if (url.substr(0, 3) === '///') {
                return url.substr(2);
            }
            else
                return url;
        },

        /**
         * 退出登录
         */
        logout() {
            this.$confirm('你确定退出登录么?', '确认退出', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {

                let delViews = this.$store.dispatch('delAllViews');
                let removUserInfo = this.$store.dispatch('remove_userinfo');
                Promise.all([delViews, removUserInfo]).then(() => {
                    // this.$router.push({path: '/login'});
                    // 
                    this.$router.go({path:'/login',force:true});
                });
                // this.$store.dispatch('remove_userinfo').then(() => {
                //     this.$router.push('/login');
                // });
            });
        },

        /**
         * 弹出框-修改密码或者系统设置
         * @param {string} cmditem 弹框类型
         */
        setDialogInfo(cmditem) {
            if (!cmditem) {
                console.log('test');
                this.$message('菜单选项缺少command属性');
                return;
            }
            switch (cmditem) {
                case 'info':
                    this.$router.push({
                        path: '/mng/edit',
                        // query: {
                        //     id: this.$store.state.user.userinfo.info['Id']
                        // }
                    });
                    break;
                case 'pass':
                    this.dialog.show_pass = true;
                    this.dialog.title = '修改密码';
                    this.dialog.user_info = {
                        name: this.$store.state.user.userinfo.info.name,
                        oldPassword: '',
                        newPassword: '',
                        password_confirm: ''
                    };
                    break;
                case 'set':
                    this.$router.push({
                        path: '/mng/edit',
                        // query: {
                        //     id: this.$store.state.user.userinfo.info['Id']
                        // }
                    });
                    break;
                case 'logout':
                    this.logout();
                    break;
            }
        },

        /**
         * 修改密码
         * @param  {object} userinfo 当前修改密码的表单信息
         */
        updUserPass(userinfo) {
            this.$refs[userinfo].validate((valid) => {
                if (valid) {
                    this.$$updatePsw({
                        data: {
                            id: this.$store.state.user.userinfo.info.id,
                            oldPassword: sha.SHA256(this.dialog[userinfo].oldPassword).toUpperCase(),
                            newPassword: sha.SHA256(this.dialog[userinfo].newPassword).toUpperCase()
                        },
                        fn: data => {
                            if (data === true) {
                                this.dialog.show_pass = false;
                                this.$message.success('修改密码成功！');
                            }

                        }
                    });
                }
            });
        },

        handleSelect(index) {
            this.$router.push(index);
        }
    }
}
