import * as sha from 'libs/SHA256.js';
import rightPanel from 'layout/right-panel/RightPanel.vue';

export default {
    name: 'list',
    components: {
        'right-panel': rightPanel
    },
    data() {
        return {

            //模块基础数据信息
            name: 'UserList',
            toggleStatus: 'open',
            padding: 8,
            rightPanelWidth: 0,
            toggle: this.$$appConfig.layout.rightPanel.toggle,
            isConfigLoaded: false,
            config: {},

            role_list: [], //角色列表
            user_list: [], //用户列表数组
            areaList: [],
            currAreaList: [],
            isEdit: false,

            //详情弹框信息
            dialog: {
                show: false,
                user_info: {}
            },

            dialog_add: {
                show: false,
                userinfo: {}
            },


            rule_data: {
                name: [{
                    required: true,
                    validator: (rule, value, callback) => {
                        if (value === '') {
                            callback(new Error('请输入用户名称'));
                        } else {
                            // if (/^[a-zA-Z0-9_-]{1,16}$/.test(value)) {
                            callback();
                            // } else {
                            // 	callback(new Error('用户名至少6位,由大小写字母和数字,-,_组成'));
                            // }
                        }
                    },
                    trigger: 'blur'
                }],


                areacode: [{
                    required: true,
                    validator: (rule, value, callback) => {
                        if (value === '' || value === undefined) {
                            callback(new Error('请选择用户所属区域'));
                        } else {
                            // if (/^[a-zA-Z0-9_-]{1,16}$/.test(value)) {
                            callback();
                            // } else {
                            // 	callback(new Error('用户名至少6位,由大小写字母和数字,-,_组成'));
                            // }
                        }
                    },
                    trigger: 'blur'
                }],

                role_id: [{
                    required: true,
                    validator: (rule, value, callback) => {
                        if (value === '' || value === undefined) {
                            callback(new Error('请选择用户角色'));
                        } else {
                            // if (/^[a-zA-Z0-9_-]{1,16}$/.test(value)) {
                            callback();
                            // } else {
                            // 	callback(new Error('用户名至少6位,由大小写字母和数字,-,_组成'));
                            // }
                        }
                    },
                    trigger: 'blur'
                }],


                email: [{
                    type: 'email',
                    message: '邮箱格式不正确！',
                    trigger: 'blur'
                }]
            }

        }
    },
    methods: {

        /**
         * 点击添加用户按钮事件
         */
        onBtnAddUserEvt() {
            this.isEdit = false;
            this.dialog_add.userinfo = {
                role_id: ''
            };
            this.dialog_add.show = true;
        },

        /**
         * 更新或新增用户
         */
        onAddUser() {
            if (this.isEdit) {
                this.$refs['userinfo'].validate((valid) => {
                    if (valid) {
                        this.$confirm('您确定要修改 ' + this.dialog_add.userinfo.name + ' 用户信息么?', '修改用户信息', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning'
                        }).then(() => {
                            let tmpData = {
                                id: this.dialog_add.userinfo.id,
                                name: this.dialog_add.userinfo.name,
                                description: this.dialog_add.userinfo.description,
                                areacode: "aa",
                                modearea: '1',
                                email: this.dialog_add.userinfo.email,
                                mobile: this.dialog_add.userinfo.mobile,
                                role_id: this.dialog_add.userinfo.role_id
                            };
                            this.$$updateUser({
                                data: tmpData,
                                fn: data => {
                                    if (data) {
                                        this.dialog_add.show = false;
                                        this.getList();
                                    }
                                },
                                errFun: err => {
                                }
                            });
                        });
                    }
                })

            }
            else {

                this.$refs['userinfo'].validate((valid) => {
                    if (valid) {
                        let shaStr = sha.SHA256(this.config.defaultPw);
                        let tmpData = {
                            name: this.dialog_add.userinfo.name,
                            description: this.dialog_add.userinfo.description,
                            areacode: this.dialog_add.userinfo.areacode,
                            modearea: '1',
                            email: this.dialog_add.userinfo.email,
                            mobile: this.dialog_add.userinfo.mobile,
                            role_id: this.dialog_add.userinfo.role_id,
                            password: shaStr.toUpperCase(),
                            viewothercityinfo: 0,
                            attention_citytree: '',
                            attention_stationtree: '',
                            department: '',
                            precinctname: '',
                            edit: '0',
                            default_page: ''
                        };
                        this.$$addUser({
                            data: tmpData,
                            fn: data => {
                                if (data) {
                                    this.dialog_add.show = false;
                                    this.getList();
                                }
                            },
                            errFun: err => {
                            }
                        });
                    }
                })
            }
        },

        /**
         * 设置权限
         */
        onEditUser(user, index, list) {
            this.currAreaList = this.areaList;
            this.isEdit = true;
            this.dialog_add.userinfo = user;

            this.dialog_add.show = true;
        },

        /**
         * 重置密码为123456
         */
        onResetPw(user) {
            let shaStr = sha.SHA256(this.config.defaultPw);

            this.$confirm('您确定重置用户 ' + user.name + ' 的密码为'+this.config.defaultPw+'吗?', '重置密码', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$$updateUser({
                    data: {
                        id: user.id,
                        role_id: user.role_id,
                        password: shaStr.toUpperCase()
                    },
                    fn: data => {
                        if (data)
                            this.getList();
                    }
                });
            });
        },


        /**
         * 删除用户事件
         * @param  {object || boolean} user  当前用户信息对象
         */
        onDeleteUser(user) {

            console.log(user);
            let id = user.id;
            this.$confirm('您确定删除用户 ' + user.name + ' 么?', '删除用户', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$$deleteUser({
                    data: {
                        id: id,
                        role_id: user.role_id
                    },
                    fn: data => {
                        if (data)
                            this.getList();
                    }
                });
            });

        },


        /**
         * 查看用户信息事件
         * @param  {object} user 当前用户信息对象
         */
        onSelectUser(user) {
            this.dialog.show = true;
            this.dialog.user_info = user;
        },


        /**
         * 获取用户信息列表方法
         */
        getList() {

            this.$$getRoles({
                data: {
                    fieldName: '*',
                    value: '*'
                },
                fn: data => {
                    if (this.$store.state.user.userinfo.info.org_id == this.config.sAdminId) {
                        this.role_list = data.filter((item) => {
                            return item.areacode == this.$store.state.user.userinfo.info.areacode;
                        });
                    }
                    else {
                        this.role_list = data.filter((item) => {
                            return item.org_id == this.$store.state.user.userinfo.info.org_id
                                && item.areacode == this.$store.state.user.userinfo.info.areacode;
                        });
                    }
                },
                errFun: err => {
                }
            });


            this.$$ArearInfoQuery({
                data: {
                    arearCode: '*'
                },
                fn: data => {
                    this.areaList = [];
                    if (this.config.isProvince.flag) {
                        this.areaList.push({label: this.config.isProvince.name, value: this.config.isProvince.value})
                    }

                    let aList = data.map(item => {
                        return {
                            label: item.areaname,
                            value: item.areacode.toString()
                        }
                    });
                    this.areaList = this.areaList.concat(aList);

                    if (!this.config.isProvince.flag) {
                        this.areaList.forEach(area => {
                            if (this.config.isProvince.areacode.toString() === area.value) {
                                area.value = this.config.isProvince.value;
                            }
                        })
                    }

                    this.$$getUsers({
                        data: {
                            fieldName: '*',
                            value: '*'
                        },
                        fn: res => {
                            if (this.config.sAdminId == this.$store.state.user.userinfo.info.org_id) {
                                this.user_list = res;
                            } else {
                                this.user_list = res.filter((item) => {
                                    return item.org_id == this.$store.state.user.userinfo.info.org_id &&
                                        item.areacode == this.$store.state.user.userinfo.info.areacode;
                                });
                            }

                            this.user_list.forEach(user => {
                                let currUserInfo = this.areaList.filter(area => {
                                    return area.value == user.areacode;
                                });
                                user.areaname = currUserInfo[0].label || '';
                            });
                        },
                        errFun: err => {
                        }
                    });

                },
                errFun: err => {
                    if (this.config.isProvince.flag) {
                        this.areaList = [];
                        this.areaList.push({label: this.config.isProvince.name, value: this.config.isProvince.value})
                    }
                }
            });
        },

        onRoleChange(roleId) {
            let currRoleInfo = this.role_list.filter(item => {
                return item.id == roleId;
            });

            if (this.$store.state.user.userinfo.info.role_id == this.config.sAdminId
                && currRoleInfo[0].areacode == this.$store.state.user.userinfo.info.areacode)//省级
            {
                this.currAreaList = this.areaList;
            } else {
                this.currAreaList = this.areaList.filter(item => {
                    return item.value === currRoleInfo[0].areacode;
                })
            }
        },

        /**
         * 右边面板状态更改事件
         * @param status 当前状态 open|close
         */
        onTogglePanel(status) {
            this.toggleStatus = status;
            this.rightPanelWidth = status === 'close' ? 0 : this.$$appConfig.layout.rightPanel.width;
        },


        onGetConfig(config) {
            this.config = config;
            this.sAdminId = this.config.sAdminId;
            this.isConfigLoaded = true;
            this.getList();
        },
    },

    created() {
        this.$$getConfig(this.onGetConfig);
    },

    mounted() {

    },
    activated() {
        if (this.isConfigLoaded)
            this.getList();
    }
}
