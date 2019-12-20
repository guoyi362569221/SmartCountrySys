/**
 * Created by kangming on 2018/8/8.
 */
import Vue from 'vue';
import _ from 'underscore';
import libs from './lib.js';
import plugins from './plugin';
import {utils} from 'utils/utils.js';


/**
 * 把一些全局对象和一些全局方法，注册到Vue原型上
 */

let GlobePlugin = {};
GlobePlugin.install = function (Vue, options) {

    let env = process.env;

    //注册第三方库
    _.each(libs, (item, key) => {
        Vue.prototype['$$' + key] = item;
    });

    //注册全局方法，如常用的接口方法，工具方法等。
    _.each(plugins, (item, key) => {
        Vue.prototype['$$' + key] = item;
    });


    if (env['NODE_ENV'] === 'development') {
        import("../config/appConfig.json").then((cfg) => {
            Vue.prototype['$$appConfig'] = cfg;
            Vue.axios.defaults.baseURL = cfg['prjInfo']['webApi']['url'];
        }).catch((err) => {
            Vue.prototype['$$appConfig'] = {};
        });
    }
    else {
        let url = 'static/config/appConfig.json?' + new Date().getTime();
        // appCfgPromise = Vue.axios({
        //     methods: 'get',
        //     headers: {},
        //     url: url,
        //     baseURL: ''
        // });
        //

        libs.lib_$.ajax({
            url: url,
            type: 'get', //GET
            async: false, //或false,是否异步
            data: {},
            timeout: 5000, //超时时间
            dataType: 'json', //返回的数据格式：
            success: function (cfg, textStatus, jqXHR) {
                Vue.prototype['$$appConfig'] = cfg;
                Vue.axios.defaults.baseURL = cfg['prjInfo']['webApi']['url'];
            },
            error: function (xhr, textStatus) {
                Vue.prototype['$$appConfig'] = {};
            },
            complete: function (data) {

            }
        });


    }
    // let cfgLoaded = new Promise(function (resolve, reject) {
    //     appCfgPromise.then((cfg) => {
    //         let data = isAjax ? cfg.data : cfg;
    //         Vue.prototype['$$appConfig'] = data;
    //         Vue.axios.defaults.baseURL = data['prjInfo']['webApi']['url'];
    //         resolve(true);
    //     }).catch((err) => {
    //         resolve(true);
    //         Vue.prototype['$$appConfig'] = {};
    //     });
    //
    // }).catch(function (err) {
    //     console.log(err);
    // });


    //  添加全局处理窗口大小变更方法
    Vue.prototype['$$resize'] = function (callFun) {
        this.$$lib_$(window).resize(() => {
            if (this._statue !== 'CLOSE') {
                callFun.call(this);
            }
        });
        this.$root.eventBus.$on('toggleMenu', () => {
            if (this._statue !== 'CLOSE') {
                callFun.call(this);
            }
        });
    };

    Vue.prototype['$$getConfig'] = function (callFun) {
        if (env['NODE_ENV'] === 'development') {
            import("../components/" + this.name + "/config.json").then((cfg) => {
                callFun(cfg);
            }).catch((err) => {
                console.error(err);
                callFun({});
            });
        }
        else {

            let defaultUrl = 'static/config/' + this.name + '/config.json?' + new Date().getTime();
            Vue.axios({
                methods: 'get',
                headers: {},
                url: defaultUrl,
                baseURL: ''
            }).then((cfg) => {
                callFun(cfg.data);
            }).catch((err) => {
                console.error(err);
                callFun({});
            })

            // let url = 'static/config/' + this.name + '/config-' + this.$store.state.user.userinfo.info.id + '.json';
            // Vue.axios({
            // 	methods: 'get',
            // 	headers: {},
            // 	url: url,
            // 	baseURL: ''
            // }).then((cfg) => {
            // 	callFun(cfg.data);
            // }).catch((err) => {
            // 	let defaultUrl = 'static/config/' + this.name + '/config.json';
            // 	Vue.axios({
            // 		methods: 'get',
            // 		headers: {},
            // 		url: defaultUrl,
            // 		baseURL: ''
            // 	}).then((cfg) => {
            // 		callFun(cfg.data);
            // 	}).catch((err) => {
            // 		callFun({});
            // 	})
            // })
        }

    };

    let mixins = {
        data() {
            return {_statue: '', config: {}}
        },
        created: function () {
            this._statue = 'CREATED';
        },


        activated: function () {
            this._statue = 'OPEN';
            
        },
        deactivated: function () {
            this._statue = 'CLOSE';
        }
    };

    Vue.mixin(mixins);

};

Vue.use(GlobePlugin);
