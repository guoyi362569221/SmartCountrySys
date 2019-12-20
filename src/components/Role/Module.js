/**
 * Created by kangming
 * date: 2017/9/7
 * desc: 框架测试
 */

import rightPanel from 'layout/right-panel/RightPanel.vue';

export default {
    name: 'list',
    components: {
        'right-panel': rightPanel
    },
    data() {
        return {

            //模块基础数据信息
            name: 'Role',
            toggleStatus: 'open',
            padding: 8,
            rightPanelWidth: 0,
            toggle: this.$$appConfig.layout.rightPanel.toggle,
            isConfigLoaded: false,
            config: {},


            role_list: [], //角色表数组
            curr_access: [], //当前角色权限信息
            isEdit: false,


            //详情弹框信息
            dialog: {
                show: false,
                role_info: {}
            },


            dialog_add: {
                show: false,
                role_info: {
                    name: '',
                    description: '',
                    org_id: ''
                }
            },


            dialog_access: {
                show: false,
                roleinfo: {}
            },

            //列表过滤状态
            status_filters: {
                list: [{
                    text: '启用',
                    value: 1
                }, {
                    text: '禁用',
                    value: 2
                }],
                multiple: false
            },

            sRoleId: 0,
            accesss: {},
            checkeds: [],
            org_list: [],
            org: '',
            orgAccesss: {},
            defaultProps: {
                children: 'children',
                label: 'name'
            },

            rule_data: {
                name: [{
                    required: true,
                    validator: (rule, value, callback) => {
                        if (value === '') {
                            callback(new Error('请输入角色名称'));
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

                org_id: [{
                    required: true,
                    validator: (rule, value, callback) => {
                        if (value === '') {
                            callback(new Error('请选择角色类型'));
                        } else {
                            // if (/^[a-zA-Z0-9_-]{1,16}$/.test(value)) {
                            callback();
                            // } else {
                            // 	callback(new Error('用户名至少6位,由大小写字母和数字,-,_组成'));
                            // }
                        }
                    },
                    trigger: 'blur'
                }]
            },

            currAccess: [],
          //表格默认高度
          tableHeight:800

        }
    },
    methods: {

        onBtnAddRole() {
            this.dialog_add.role_info = {
                name: '',
                description: '',
                org_id: ''
            };
            this.dialog_add.show = true;
            this.isEdit = false;
            if (this.$refs.accesss)
                this.$refs.accesss.setCheckedKeys([]);
            this.checkeds = [];
        },

        /**
         * 添加角色
         */
        onAddRole() {
            let data = this.dialog_add.role_info;
            this.checkeds = [];
            if (this.isEdit) {

                this.$refs['roleInfo'].validate((valid) => {
                    if (valid) {
                        this.$confirm('您确定要修改 ' + this.dialog_add.role_info.name + ' 角色信息么?', '修改角色', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning'
                        }).then(() => {
                            let tmpData = {
                                id: this.dialog_add.role_info.id,
                                name: this.dialog_add.role_info.name,
                                org_id: this.dialog_add.role_info.org_id,
                                areacode: this.$store.state.user.userinfo.info.areacode,
                                description: this.dialog_add.role_info.description
                            };
                            this.$$updateRole({
                                data: tmpData,
                                fn: data => {
                                    if (data) {
                                        this.dialog_add.show = false;
                                        this.getList();
                                    }
                                },
                                errFun: err => {}
                            });
                        });
                    }
                });

            } else {
                this.$refs['roleInfo'].validate((valid) => {
                    if (valid) {
                        let currSelectedNode = this.$refs.accesss.getCheckedNodes(true); //获取当前选中的子节点
                        currSelectedNode.forEach((item) => { //子节点被选中时同时需要获取父节点
                            this.checkeds.push(item.access);
                            if (item.parent !== '' && this.checkeds.indexOf(item.parent) === -1) {
                                this.checkeds.push(item.parent);

                                if (item.parent.split('/').length > 2 && tmpCheckeds.indexOf('/' + item.parent.split('/')[1]) === -1) //判断三级
                                {
                                    tmpCheckeds.push('/' + item.parent.split('/')[1]);
                                }
                            }
                        });
                        data.funs = this.checkeds;
                        data.org_id = this.dialog_add.role_info.org_id;
                        data.areacode = this.$store.state.user.userinfo.info.areacode;
                        this.$$addRole({
                            data: data,
                            fn: data => {
                                if (data) {
                                    this.dialog_add.show = false;
                                    this.getList();
                                }
                            },
                            errFun: err => {}
                        });

                    }
                });
            }
        },

        /**
         * 查看角色信息事件
         * @param  {object} role 当前角色信息对象
         */
        onSelectRole(role) {
            this.curr_access = [];
            this.dialog.show = true;
            this.dialog.role_info = role;
            this.curr_access = role.funs;
        },

        /**
         * 编辑角色信息
         * @param role
         */
        onEditRole(role) {
            this.isEdit = true;
            this.dialog_add.show = true;
            this.dialog_add.role_info = role;
        },


        /**
         * 设置权限
         */
        onBtnSetAccess(role) {
            this.dialog_access.roleinfo = role;
            this.dialog_access.show = true;
            this.currAccess = [];
            for (let i = 0; i < role['rolefuns'].length; i++) {
                let tmp = role['rolefuns'][i];
                let num = parse(tmp, role['rolefuns']);
                if (num === 1)
                    this.currAccess.push(tmp);
            }

            function parse(substr, arr) {
                let num = 0;
                arr.forEach((a) => {
                    let idx = a.toString().indexOf(substr);
                    if (idx >= 0) {
                        if (substr.toString().length === a.toString().length) {
                            num++;
                        } else if (a.toString().substr(substr.toString().length, 1) === '/') {
                            num++;
                        }
                    }
                });
                return num;
            }

            if (this.$refs.updateAccesss)
                this.$refs.updateAccesss.setCheckedKeys(this.currAccess);

            console.log(this.currAccess);
        },

        /**
         * 更新角色权限
         */
        onResetRoleAccess() {

            this.$confirm('您确定要修改 ' + this.dialog_access.roleinfo.name + ' 角色的权限么?', '修改权限', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let tmpCheckeds = [];
                let currSelectedNode = this.$refs.updateAccesss.getCheckedNodes(true); //获取当前选中的子节点
                currSelectedNode.forEach((item) => { //子节点被选中时同时需要获取父节点
                    tmpCheckeds.push(item.access);
                    if (item.parent !== '' && tmpCheckeds.indexOf(item.parent) === -1) {
                        tmpCheckeds.push(item.parent);

                        if (item.parent.split('/').length > 2) //判断三级
                        {
                            tmpCheckeds.push('/' + item.parent.split('/')[1]);
                        }
                    }
                });
                let data = {
                    id: this.dialog_access.roleinfo.id,
                    org_id: this.dialog_access.roleinfo.org_id
                };

                data.funs = tmpCheckeds;
                this.$$updateRole({
                    data: data,
                    fn: data => {
                        if (data) {
                            this.dialog_access.show = false;
                            this.getList();
                        }
                    },
                    errFun: err => {}
                });
            });


        },


        /**
         * 递归根据当前用户功能权限构建功能权限树
         * @param items 权限列表
         * @param funs 当前用户权限列表
         * @param datas 用于填充最终数据的数组
         * @param names 用于填充权限名称的数组
         * @private
         */
        _parseAccess(items, funs, datas, names) {
            items.forEach((item) => {
                let obj = {};
                if (funs.indexOf(item.access) > -1) {
                    obj.access = item.access;
                    obj.path = item.path;
                    obj.name = item.name;
                    obj.children = [];

                    datas.push(obj);
                    if (item.children === undefined || item.children.length === 0)
                        names.push(obj.name);
                    if (item.children && item.children.length > 0) {
                        this._parseAccess(item.children, funs, obj.children, names);
                    }
                }
            });
        },

        filterNode(value, data) {
            if (!value) return true;
            return data.label.indexOf(value) !== -1;
        },


        /**
         * 初始化组装路由
         * @return {array} 路由数组
         */
        initRouters(funs) {
            let routes = this.$router.options.routes;
            let accessFuns = [];
            for (let i = 0; i < routes.length; i++) {
                if (routes[i].hidden !== true && routes[i].children && routes[i].children.length) {
                    let tempObj = {},
                        module = routes[i],
                        menus = module.children;
                    tempObj.name = module.name;
                    tempObj.path = module.path;
                    tempObj.access = module.path;

                    tempObj.children = [];
                    tempObj.parent = '';
                    if (funs.indexOf(tempObj.path) > -1) {
                        if (menus.length === 1 && menus[0].isFullPage) {
                            accessFuns.push(tempObj);
                        } else {

                            for (let j = 0; j < menus.length; j++) {
                                if (menus[j].hidden !== true) {
                                    if (menus[j].children && menus[j].children.length && (!menus[j].meta || (menus[j].meta && !menus[j].meta.noAccess))) {
                                        let tempChildObj = {},
                                            menu = menus[j],
                                            pages = menu.children;
                                        tempChildObj.name = menu.name;
                                        tempChildObj.path = '/' + menu.path;
                                        tempChildObj.access = tempObj.path + '/' + menu.path;
                                        tempChildObj.parent = tempObj.path;
                                        tempChildObj.children = [];
                                        for (let k = 0; k < pages.length; k++) {
                                            if (pages[k].hidden !== true) {
                                                let tempPageObj = {},
                                                    page = pages[k];
                                                tempPageObj.name = page.name;
                                                tempPageObj.path = '/' + page.path;
                                                tempPageObj.access = tempObj.path + '/' + menu.path + '/' + page.path;
                                                tempPageObj.parent = tempObj.path + '/' + menu.path;
                                                if (funs.indexOf(tempPageObj.access) > -1)
                                                    tempChildObj.children.push(tempPageObj);
                                            }
                                        }
                                        tempObj.children.push(tempChildObj);
                                    } else if (!menus[j].meta || (menus[j].meta && !menus[j].meta.noAccess)) {
                                        let tempChildNonChildObj = {},
                                            menu = menus[j];
                                        tempChildNonChildObj.name = menu.name;
                                        tempChildNonChildObj.path = '/' + menu.path;
                                        tempChildNonChildObj.parent = tempObj.path;
                                        tempChildNonChildObj.access = tempObj.path + '/' + menu.path;
                                        if (funs.indexOf(tempChildNonChildObj.access) > -1)
                                            tempObj.children.push(tempChildNonChildObj);
                                    }

                                }
                            }
                            if (funs.indexOf(tempObj.path) > -1)
                                accessFuns.push(tempObj);
                        }
                    }

                }
            }

            return accessFuns;
        },


        /**
         * 删除角色事件
         * @param  {object} role  当前角色
         * @param  {number} index 当前角色列表索引
         * @param  {array} list  当前角色列表数组
         */
        onDeleteRole(role, index, list) {
            let id = role.id;
            this.$confirm('删除角色前请对该角色下的用户重新分配角色，否则该角色下的用户会被同步删除，您确定要删除角色 ' + role.name + ' 么?', '删除角色', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$$deleteRole({
                    data: {
                        id: id,
                        org_id: role.org_id
                    },
                    fn: data => {
                        if (data) {
                            this.getList();
                        }
                    }
                });
            });

        },

        /**
         * 获取角色信息列表方法
         */
        getList() {
            this.role_list = [];
            this.$$getRoles({
                data: {
                    fieldName: '*',
                    value: '*'
                },
                fn: data => {
                    data.forEach((item) => {
                        let tmp = [];
                        let names = [];
                        this.$$getOrgs({
                            data: {
                                fieldName: 'id',
                                value: item['org_id']
                            },
                            fn: orgData => {
                                orgData.forEach((oitem) => {
                                    let accessFuns = this.initRouters(oitem['orgfuns']);
                                    this.accesss[item.id] = accessFuns;
                                    this._parseAccess(accessFuns, item['rolefuns'], tmp, names);
                                    item.funs = tmp;
                                    item.access = names;
                                    item.roleType = oitem.name;
                                    this.role_list.push(item);
                                });
                                this.onResize();
                            },
                            errFun: err => {}
                        });

                    });

                },
                errFun: err => {}
            });
        },

        /**
         * 右边面板状态更改事件
         * @param status 当前状态 open|close
         */
        onTogglePanel(status) {
            this.toggleStatus = status;
            this.rightPanelWidth = status === 'close' ? 0 : this.$$appConfig.layout.rightPanel.width;
        },

        /**
         * 获取角色信息列表方法
         */
        getOrgList() {
            this.$$getOrgs({
                data: {
                    fieldName: '*',
                    value: '*'
                },
                fn: data => {
                    this.org_list = data.map((item) => {
                        return {
                            label: item.name,
                            value: item.id
                        }
                    });

                    data.forEach(item => {
                        this.orgAccesss[item.id] = this.initRouters(item['orgfuns']);
                    });

                    if (this.org_list.length > 0)
                        this.org = this.org_list[0].value;
                },
                errFun: err => {}
            });
        },
        onGetConfig(config) {
            this.config = config;
            this.sRoleId = this.config.sRoleId;
        },
      onResize(){
        this.$nextTick(() => {
          this.tableHeight = this.$refs.role_table.offsetHeight-40;
        });
      }
    },

    created() {
      this.$$resize(this.onResize);
        this.$$getConfig(this.onGetConfig);
    },

    mounted() {
        // this.initRouters();
        // this.getList();
    },

    activated() {
        this.getList();
        this.getOrgList();
    }
}