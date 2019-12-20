import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

import user from './user/';
import global from './global/';
import leftmenu from './leftmenu/';
import router from './router/';
import tagsView from './tagsView/';

export default new Vuex.Store({
    modules: {
        user,
		global,
		router,
		leftmenu,
        tagsView
    }
});
