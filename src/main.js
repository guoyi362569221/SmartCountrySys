import 'babel-polyfill';
import Vue from 'vue';

// element-ui
import ElementUI from 'element-ui';
// import 'element-ui/lib/theme-chalk/index.css';
import 'assets/styles/element-#3894F6/index.css';
import 'assets/styles/element-override/#3894F6/index.css';

Vue.use(ElementUI, {
    size: 'small'
});

import VueI18n from 'vue-i18n';

Vue.use(VueI18n);
import {
    zh
} from '@/i18n/';

const messages = {
    zh: zh
};

const i18n = new VueI18n({
    locale: 'zh',
    messages
});

//页面顶部进度条
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

Vue.config.productionTip = true;
Vue.config.devtools = true;

import VueECharts from 'vue-echarts';

Vue.component('chart', VueECharts);
import 'assets/styles/index.css';
import 'font-awesome/css/font-awesome.css';
import router from 'router/';
import store from 'store/';
import App from './App';
import {
    dateUtils
} from 'utils/dateUtils.js';
import 'register/';

import {
    gbs
} from 'config/';

router.routerAsyncFun(function (router) {
    new Vue({
        el: '#app',
        data() {
            return {
                eventBus: new Vue()
            };
        },
        router,
        store,
        i18n,
        template: '<App/>',
        components: {
            App
        }
    });


    router.beforeEach((to, from, next) => {
        NProgress.start();
        if (to.path === '/login') {
            // if (!store.state.user.userinfo.token) { //判断token是否存在
            //     next({
            //         replace: true,
            //         path: '/login'
            //     });

            //     store.dispatch('remove_userinfo');
            //     NProgress.done();
            // } else {//如果token存在判断有效性
            //     let expiresData = dateUtils.strToDate(store.state.user.userinfo.token['.expires']);
            //     let diff = dateUtils.dateDiff('n', new Date(), expiresData);
            //     if (diff >= 2) //有效时间大于两分钟
            //     {
            //         if (store.state.user.userinfo.web_routers.indexOf(from.path) === -1)//判断权限
            //             next()
            //         else
            //             next({
            //                 replace: true,
            //                 path: from.path
            //             });
            //     } else
            //         next();
            // }

            next();
        } else if (!store.state.user.userinfo.token && to.path !== '/login') { //判断token是否存在

            // next({
            //     replace: true,
            //     path: '/login'
            // });

            store.dispatch('remove_userinfo');
            store.dispatch('delAllViews');
            router.go({path:'/login',force:true});
            NProgress.done();
        } else if (!gbs.access && process.env['NODE_ENV'] === 'development') {//开发环境下全局不考虑权限
            next();
        }
        else if (to.meta&&to.meta.noAccess) {//某一模块不受权限限制
            next();
        }
        else if (store.state.user.userinfo.web_routers.indexOf(to.path) === -1) //未授权访问
        {
            let lastIdx = to.path.lastIndexOf('/');
            let parentPath = to.path.substr(0, lastIdx);
            let arr = parentPath.split('/');
            let parentPathName = arr[arr.length - 1];
            let flg = true;
            for (let i = 0; i < store.state.user.userinfo.web_routers.length; i++) {
                let currRouter = store.state.user.userinfo.web_routers[i];
                let currRouterArr = currRouter.split('/');
                if (currRouterArr.indexOf(parentPathName) > -1 && currRouter !== parentPath) {
                    next(currRouter);
                    NProgress.done();
                    flg = false;
                    break;
                }
            }
            if (flg) {
                next({
                    replace: true,
                    path: from.path
                });

                NProgress.done();
            }
        } else {
            let expiresData = dateUtils.strToDate(store.state.user.userinfo.token['.expires']);
            let diff = dateUtils.dateDiff('n', new Date(), expiresData);
            if (diff >= 2) //有效时间大于两分钟
                next();
            else if (to.path !== '/login') {
                router.go({path:'/login',force:true});
                // next({
                //     path: '/login'
                // });
                NProgress.done();
            } else
                next();
        }

    });

    router.afterEach(transition => {
        NProgress.done();
    });
});
