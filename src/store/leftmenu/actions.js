import * as types from './mutations_types';

export default {
    set_menu_open: ({
        commit
    }) => {
        commit(types.SET_MENU_OPEN);
    },
    set_menu_close: ({
        commit
    }) => {
        commit(types.SET_MENU_CLOSE);
    },
    set_menu_show: ({
        commit
    }) => {
        commit(types.SET_MENU_SHOW);
    },
    set_menu_hide: ({
        commit
    }) => {
        commit(types.SET_MENU_HIDE);
    }
};