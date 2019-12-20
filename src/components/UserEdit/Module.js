import rightPanel from 'layout/right-panel/RightPanel.vue';

export default {
    name: 'user',
    components: {
        'right-panel': rightPanel
    },
    data() {
        return {

            //模块基础数据信息
            name: 'UserEdit',
            toggleStatus: 'open',
            padding: 8,
            rightPanelWidth: 0,
            toggle: this.$$appConfig.layout.rightPanel.toggle,
            isConfigLoaded: false,
            config: {},


            user_data: {
                default_page: ''
            },
            user_rules: {
                email: [{
                    message: '邮箱不能为空！',
                    trigger: 'blur'
                }, {
                    type: 'email',
                    message: '邮箱格式不正确！',
                    trigger: 'blur'
                }],
                name: [{
                    required: true,
                    message: '用户名不能为空！',
                    trigger: 'blur'
                }]
            },

            //tree选中
            checkeds: {
                web_routers: {},
            },

            //tree数据属性
            props: {
                web_routers: {
                    children: 'children',
                    label: 'name'
                },
                api_routers: {
                    children: 'list',
                    label: 'name'
                }
            },

            //tree数据
            datas: {
                //web页面路由数据-tree
                web_routers: [],
            },


            routes: [],

            model: {
                area: [{
                    label: '全国',
                    value: '1'
                }, {
                    label: '中东部',
                    value: '2'
                }, {
                    label: '京津冀',
                    value: '3'
                }]
            }
        }
    },
    methods: {
        save_user(userdata) {
            this.$refs[userdata].validate((valid) => {
                if (valid) {
                    let tmpCheckeds = [];
                    let currSelectedNode = this.$refs.webRouters.getCheckedNodes(true);//获取当前选中的子节点
                    currSelectedNode.forEach((item) => {//子节点被选中时同时需要获取父节点
                        let tmpItem = {
                            funid: item.access,
                            collectsatus: item.collectsatus,
                            showcollectstatus: item.showcollectstatus
                        };

                        tmpCheckeds.push(tmpItem);
                        if (item.parent !== '') {
                            if (tmpCheckeds.some(v => v.funid === item.parent)) {
                            }
                            else {
                                let tmpPItem = {
                                    funid: item.parent,
                                    collectsatus: item.collectsatus,
                                    showcollectstatus: item.showcollectstatus
                                };
                                tmpCheckeds.push(tmpPItem);

                                
                               
                                if (item.parent.split('/').length > 2 && !tmpCheckeds.some(v => v.funid === '/' + item.parent.split('/')[1])) //判断三级菜单
                                {
                                    tmpCheckeds.push({
                                        funid: '/' + item.parent.split('/')[1],
                                        collectsatus: item.collectsatus,
                                        showcollectstatus: item.showcollectstatus
                                    });
                                }
                            }
                        }
                    });
                    this.$delete(this[userdata], 'password');
                    this.$delete(this[userdata], 'userfuns');
                    this.$set(this[userdata], 'funs', tmpCheckeds);


                    this.$$updateUser({
                        data: {
                            id: this[userdata].id,
                            name: this[userdata].name,
                            description: this[userdata].description,
                            areacode: this[userdata].areacode,
                            modearea: this[userdata].modearea,
                            email: this[userdata].email,
                            mobile: this[userdata].mobile,
                            role_id: this[userdata].role_id,
                            viewothercityinfo: 0,
                            attention_citytree: '',
                            attention_stationtree: '',
                            department: '',
                            precinctname: '',
                            edit: '0',
                            default_page: this[userdata].default_page,
                            funs: tmpCheckeds
                        },
                        fn: data => {
                            if (data) {
                                this.$alert('修改用户信息成功,若修改了功能菜单需重新登录!', '提示', {
                                    confirmButtonText: '确定',
                                    type: 'success'
                                });
                            }
                        },
                        errFun: err => {

                        }
                    });
                }
            });
        },


        getView() {
            this.$$getUsers({
                data: {
                    fieldName: 'id',
                    value: this.$store.state.user.userinfo.info.id
                },
                fn: data => {
                    this.user_data = data.length > 0 ? data[0] : {};
                    let userFuns = this.user_data['userfuns'].map(fun => {
                        return fun['funid'];
                    });

                    if (this.user_data && this.user_data.role_id !== undefined) {
                        this.$$getRoles({
                            data: {
                                fieldName: 'id',
                                value: this.user_data.role_id
                            },
                            fn: data => {
                                if (data.length > 0) {
                                    this.datas.web_routers = [];
                                    this.checkeds.web_routers = {};
                                    //获取赋予给当前用户的权限信息

                                    let tmpAccess = userFuns.length > 0 ? userFuns : data[0]['rolefuns'];
                                    let currAccess = [];
                                    for (let i = 0; i < tmpAccess.length; i++) {
                                        let tmp = tmpAccess[i];
                                        let num = parse(tmp, tmpAccess);
                                        if (num === 1)
                                            currAccess.push(tmp);
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


                                    this._parseAccess(this.routes, data[0]['rolefuns'], this.datas.web_routers, this.checkeds.web_routers, currAccess);

                                    if (this.$refs.webRouters) {
                                        this.$refs.webRouters.setCheckedKeys(currAccess);
                                    }


                                }
                            },
                            errFun: err => {
                            }
                        });
                    }
                },
                errFun: err => {
                }
            });
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
                        this.routes.push(tempObj);
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
                                } else if (!menus[j].meta || ( menus[j].meta && !menus[j].meta.noAccess)) {
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
                        this.routes.push(tempObj);
                    }
                }
            }
        },

        /**
         * 递归根据当前用户功能权s限构建功能权限树
         * @param items 权限列表
         * @param funs 当前用户权限列表
         * @param datas 用于填充最终数据的数组
         * @param list 用于填充权限名称对象
         * @private
         */
        _parseAccess(items, funs, datas, list, checkedList) {
            items.forEach((item) => {
                let obj = {};
                if (funs.indexOf(item.access) > -1) {
                    obj.access = item.access;
                    obj.path = item.path;
                    obj.name = item.name;
                    obj.parent = item.parent;
                    obj.collectsatus = 0;
                    obj.showcollectstatus = 0;
                    obj.children = [];
                    if (item.children === undefined || item.children.length === 0) {
                        let idx = checkedList.indexOf(item.access);
                        if (idx > -1) {
                            this.$set(list, item.access, item.name);
                            let currFuns = this.user_data['userfuns'].filter(funItem => {//获取用户的快捷菜单信息
                                return funItem['funid'] === item.access;
                            });
                            if (currFuns.length > 0) {
                                obj.collectsatus = currFuns[0].collectsatus;
                                obj.showcollectstatus = currFuns[0].showcollectstatus;
                            }
                            else {
                                obj.collectsatus = currFuns[0].collectsatus;
                                obj.showcollectstatus = currFuns[0].showcollectstatus;
                            }
                        }
                    }
                    datas.push(obj);

                    if (item.children && item.children.length > 0) {
                        this._parseAccess(item.children, funs, obj.children, list, checkedList);
                    }


                }
            });
        },

        /**
         * 改变web页面选项时触发
         * @param data  当前改变的对象
         * @param selfIsChecked 当前是否选中
         */
        checkChangeWebRouters(data, selfIsChecked, childIsChecked) {
            if (selfIsChecked) {
                if (!this.checkeds.web_routers[data.access])
                    this.$set(this.checkeds.web_routers, data.access, data.name);
                if (data.children) {
                    data.children.forEach(chl => {
                        if (!this.checkeds.web_routers[chl.access]) {
                            this.$set(this.checkeds.web_routers, chl.access, chl.name);
                        }
                    })

                }
            }

            else {
                if (this.checkeds.web_routers[data.access])
                    this.$delete(this.checkeds.web_routers, data.access);

                if (data.children) {
                    data.children.forEach(chl => {
                        if (this.checkeds.web_routers[chl.access]) {
                            this.$delete(this.checkeds.web_routers, chl.access);
                        }
                    })

                }

            }
        },
        /**
         * 右边面板状态更改事件
         * @param status 当前状态 open|close
         */
        onTogglePanel(status) {
            this.toggleStatus = status;
            this.rightPanelWidth = status === 'close' ? 0 : this.$$appConfig.layout.rightPanel.width;
        }
    },
    mounted() {
        this.initRouters();//获取所用功能菜单信息
        // this.getView();
    },

    activated() {
        this.getView();
    },

    deactivated() {

    }
}
