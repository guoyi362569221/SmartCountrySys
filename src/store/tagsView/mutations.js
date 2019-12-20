import * as types from './mutations_types'

export default {
    [types.ADD_VISITED_VIEWS](state, view) {
        if (state.visitedViews.some(v => v.path === view.path)) return
        state.visitedViews.push({
            name: view.name,
            path: view.path,
            title: view.meta.title || 'no-name'
        })
        if (!view.meta.noCache) {
            state.cachedViews.push(view.name)
        }
    },

    [types.DEL_VISITED_VIEWS](state, view) {
        for (const [i, v] of state.visitedViews.entries()) {
            if (v.path === view.path) {
                state.visitedViews.splice(i, 1)
                break
            }
        }
        for (const i of state.cachedViews) {
            if (i === view.name) {
                const index = state.cachedViews.indexOf(i)
                state.cachedViews.splice(index, 1)
                break
            }
        }
    },

    [types.DEL_OTHERS_VIEWS](state, view) {
        for (const [i, v] of state.visitedViews.entries()) {
            if (v.path === view.path) {
                state.visitedViews = state.visitedViews.slice(i, i + 1)
                break
            }
        }
        for (const i of state.cachedViews) {
            if (i === view.name) {
                const index = state.cachedViews.indexOf(i)
                state.cachedViews = state.cachedViews.slice(index, i + 1)
                break
            }
        }
    },

    [types.DEL_ALL_VIEWS](state) {
        state.visitedViews = [];
        state.cachedViews = []
    },
};