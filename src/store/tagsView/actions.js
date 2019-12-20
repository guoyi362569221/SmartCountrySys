import * as types from './mutations_types';

export default  {
    addVisitedViews({ commit }, view) {
        commit('ADD_VISITED_VIEWS', view)
    },
    delVisitedViews({ commit, state }, view) {
        return new Promise((resolve) => {
            commit('DEL_VISITED_VIEWS', view)
            resolve([...state.visitedViews])
        })
    },
    delOthersViews({ commit, state }, view) {
        return new Promise((resolve) => {
            commit('DEL_OTHERS_VIEWS', view)
            resolve([...state.visitedViews])
        })
    },
    delAllViews({ commit, state }) {
        return new Promise((resolve) => {
            commit('DEL_ALL_VIEWS')
            resolve([...state.visitedViews])
        })
    }
};