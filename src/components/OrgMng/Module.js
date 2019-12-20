/**
 * Created by kangming
 * date: 2018/3/22
 * desc: 框架测试
 */


export default {
    name: 'list',
    components: {},
    data() {
        return {

            //模块基础数据信息
            name: 'OrgMng',
            toggleStatus: 'open',
            padding: 8,
            rightPanelWidth: 0,
            isConfigLoaded: false,
            config: {},


            org_list: [], //角色表数组
            curr_access: [],//当前角色权限信息
            isEdit: false,


            //详情弹框信息
            dialog: {
                show: false,
                org_info: {}
            },


            dialog_add: {
                show: false,
                org_info: {
                    name: '',
                    description: ''
                }
            },

            dialog_access: {
                show: false,
                orginfo: {}
            },

            accesss: [],
            checkeds: [],
            defaultProps: {
                children: 'children',
                label: 'name'
            },

            rule_data: {
                name: [{
                    required: true,
                    validator: (rule, value, callback) => {
                        if (value === '') {
                            callback(new Error('请输入名称'));
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
            },

            currAccess: []

        }
    },
    methods: {

        onBtnAddOrg() {
            this.dialog_add.org_info = {
                name: '',
                description: ''
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
        onAddOrg() {
            let data = this.dialog_add.org_info;
            this.checkeds = [];
            if (this.isEdit) {

                this.$refs['orgInfo'].validate((valid) => {
                    if (valid) {
                        this.$confirm('您确定要修改 ' + this.dialog_add.org_info.name + ' 信息么?', '修改信息', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning'
                        }).then(() => {
                            let tmpData = {
                                id: this.dialog_add.org_info.id,
                                name: this.dialog_add.org_info.name,
                                description: this.dialog_add.org_info.description
                            };
                            this.$$updateOrg({
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
                });

            }
            else {
                this.$refs['orgInfo'].validate((valid) => {
                    if (valid) {
                        let currSelectedNode = this.$refs.accesss.getCheckedNodes(true);//获取当前选中的子节点
                        currSelectedNode.forEach((item) => {//子节点被选中时同时需要获取父节点
                            this.checkeds.push(item.access);
                            if (item.parent !== '' && this.checkeds.indexOf(item.parent) === -1) {
                                this.checkeds.push(item.parent);


                                if(item.parent.split('/').length>2&& this.checkeds.indexOf('/'+item.parent.split('/')[1]) === -1)//判断三级
                                {
                                    this.checkeds.push('/'+item.parent.split('/')[1]);
                                }
                            }
                        });
                        data.funs = this.checkeds;
                        this.$$addOrg({
                            data: data,
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
                });
            }
        },

        /**
         * 查看角色信息事件
         * @param  {object} org 当前角色信息对象
         */
        onSelectOrg(org) {
            this.curr_access = [];
            this.dialog.show = true;
            this.dialog.org_info = org;
            this.curr_access = org.funs;
        },

        /**
         * 编辑角色信息
         * @param org
         */
        onEditOrg(org) {
            this.isEdit = true;
            this.dialog_add.show = true;
            this.dialog_add.org_info = org;
        },


        /**
         * 设置权限
         */
        onBtnSetAccess(org) {
            this.dialog_access.orginfo = org;
            this.dialog_access.show = true;
            this.currAccess = [];
            for (let i = 0; i < org['orgfuns'].length; i++) {
                let tmp = org['orgfuns'][i];
                let num = parse(tmp, org['orgfuns']);
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
                        }
                        else if (a.toString().substr(substr.toString().length, 1) === '/') {
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
        onResetOrgAccess() {

            this.$confirm('您确定要修改 ' + this.dialog_access.orginfo.name + ' 的权限么?', '修改权限', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let tmpCheckeds = [];
                let currSelectedNode = this.$refs.updateAccesss.getCheckedNodes(true);//获取当前选中的子节点
                currSelectedNode.forEach((item) => {//子节点被选中时同时需要获取父节点
                    tmpCheckeds.push(item.access);
                    if (item.parent !== '' && tmpCheckeds.indexOf(item.parent) === -1) {
                        tmpCheckeds.push(item.parent);

                        
                        if(item.parent.split('/').length>2&& tmpCheckeds.indexOf('/'+item.parent.split('/')[1]) === -1)//判断三级
                        {
                            tmpCheckeds.push('/'+item.parent.split('/')[1]);
                        }
                    }
                });
                let data = {
                    id: this.dialog_access.orginfo.id
                };

                data.funs = tmpCheckeds;
                this.$$updateOrg({
                    data: data,
                    fn: data => {
                        if (data) {
                            this.dialog_access.show = false;
                            this.getList();
                        }
                    },
                    errFun: err => {
                    }
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
        initRouters() {
            let routes = this.$router.options.routes;
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
                    if (menus.length === 1 && menus[0].isFullPage) {
                        this.accesss.push(tempObj);
                    } else {

                        for (let j = 0; j < menus.length; j++) {
                            if (menus[j].hidden !== true) {
                                if (menus[j].children && menus[j].children.length && (!menus[j].meta || ( menus[j].meta && !menus[j].meta.noAccess))) {
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
                                            tempChildObj.children.push(tempPageObj);
                                        }
                                    }
                                    tempObj.children.push(tempChildObj);
                                } else if(!menus[j].meta || ( menus[j].meta && !menus[j].meta.noAccess)) {
                                    let tempChildNonChildObj = {},
                                        menu = menus[j];
                                    tempChildNonChildObj.name = menu.name;
                                    tempChildNonChildObj.path = '/' + menu.path;
                                    tempChildNonChildObj.parent = tempObj.path;
                                    tempChildNonChildObj.access = tempObj.path + '/' + menu.path;
                                    tempObj.children.push(tempChildNonChildObj);
                                }

                            }
                        }
                        this.accesss.push(tempObj);
                    }
                }
            }
        },


        /**
         * 删除角色事件
         * @param  {object} org  当前角色
         * @param  {number} index 当前角色列表索引
         * @param  {array} list  当前角色列表数组
         */
        onDeleteOrg(org, index, list) {
            let id = org.id;
            this.$confirm('删除前请对该机构下的用户重新分配角色，否则该机构下的用户会被同步删除，您确定要删除 ' + org.name + ' 么?', '删除', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$$deleteOrg({
                    data: {
                        id: id
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
            this.$$getOrgs({
                data: {
                    fieldName: '*',
                    value: '*'
                },
                fn: data => {
                    data.forEach((item) => {
                        let tmp = [];
                        let names = [];
                        this._parseAccess(this.accesss, item['orgfuns'], tmp, names);
                        item.funs = tmp;
                        item.access = names;
                    });
                    this.org_list = data;
                },
                errFun: err => {
                }
            });
        }
    },

    mounted() {
        this.initRouters();
        // this.getList();
    },

    activated() {
        this.getList();
    }
}
