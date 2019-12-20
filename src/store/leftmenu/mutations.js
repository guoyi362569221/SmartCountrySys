import * as types from './mutations_types'

export default {
    [types.SET_MENU_OPEN](state) {
        state.width = '200px';
        state.preWidth = '200px';
        state.menu_flag = true;
    },
    [types.SET_MENU_CLOSE](state) {
        state.width = '44px';
        state.preWidth = '44px';
        state.menu_flag = false;
    },

    [types.SET_MENU_HIDE](state) {
        state.width = '0';
    },
    
    [types.SET_MENU_SHOW](state) {
        state.width = state.preWidth; 
    }
};
