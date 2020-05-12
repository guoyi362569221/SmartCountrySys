
import Vue from 'vue';
import Router from 'vue-router';
import axios from 'axios';
import VueAxios from 'vue-axios';
Vue.use(VueAxios, axios);


Vue.use(Router);

import {Home, Content, Body, NotFound} from 'layout/';

const Login = () => import('components/login/login.vue');
const Index = () => import('components/Index/Module.vue');
const List = () => import('components/Role/Module.vue');
const userList = () => import('components/UserList/Module.vue');
const Edit = () => import('components/UserEdit/Module.vue');
const Org = () => import('components/OrgMng/Module.vue');

const MonitorAnaysis = () => import('components/MonitorAnaysis/Module.vue');

const routerCfg = {
    'Home': Home,
    'Login': Login,
    'Body': Body,
    'Index': Index,
    'List': List,
    'Org':Org,
    'userList': userList,
    'Edit': Edit,
    'MonitorAnaysis':MonitorAnaysis
};

let env = process.env;
let promiseDef;

if (env['NODE_ENV'] === 'development') {//开发环境
    promiseDef = import("../config/routerConfig.json");
}
else {//生成环境
    let defaultUrl = 'static/config/routerConfig.json?' + new Date().getTime();
    promiseDef = Vue.axios({
        methods: 'get',
        headers: {},
        url: defaultUrl,
        baseURL: ''
    });
}

/**
 * 递归解析路由配置
 * @param cfgs
 */
function parseRouter(cfgs) {
    for (let i = 0; i < cfgs.length; i++) {
        if (routerCfg[cfgs[i]['component']]) {
            cfgs[i]['component'] = routerCfg[cfgs[i]['component']]
        } else {
            cfgs[i]['component'] = NotFound;
        }
        if (cfgs[i]['children'])
            parseRouter(cfgs[i]['children'])
    }
}

async function routerAsyncFun(callfun) {
    try {
        const res = await promiseDef;
        let routers = env['NODE_ENV'] === 'development' ? res : res.data;
        parseRouter(routers);
        callfun(new Router({
            routes: routers
        }))
    } catch (err) {
        callfun(new Router({
            routes: []
        }))
    }
}
export default {
    routerAsyncFun
};
