<template>
    <div class="tags-view-container">
        <scroll-pane class='tags-view-wrapper' ref='scrollPane'>
            <router-link ref='tag' class="tags-view-item" :class="isActive(tag)?'active':''"
                         v-for="tag in Array.from(visitedViews)"
                         :to="tag.path" :key="tag.path" @contextmenu.prevent.native="openMenu(tag,$event)">
                {{tag.name}}
                <span class='el-icon-close' @click.prevent.stop='closeSelectedTag(tag)'></span>
            </router-link>
        </scroll-pane>
        <ul class='contextmenu' v-show="visible" :style="{left:left+'px',top:top+'px'}">
            <li @click="closeSelectedTag(selectedTag)">关闭</li>
            <li @click="closeOthersTags">关闭其他</li>
            <li @click="closeAllTags">关闭所有</li>
        </ul>
    </div>
</template>

<script>

    export default {
        components: {},
        data() {
            return {
                visible: false,
                top: 0,
                left: 0,
                selectedTag: {}
            }
        },
        computed: {
            visitedViews() {
                return this.$store.state.tagsView.visitedViews
            }
        },
        watch: {
            $route() {
                this.addViewTags();
                this.moveToCurrentTag()
            },
            visible(value) {
                if (value) {
                    document.body.addEventListener('click', this.closeMenu)
                } else {
                    document.body.removeEventListener('click', this.closeMenu)
                }
            }
        },
        mounted() {
            this.addViewTags()
        },
        methods: {
            generateRoute() {
                if (this.$route.name) {
                    return this.$route
                }
                return false
            },
            isActive(route) {
                return route.path === this.$route.path || route.name === this.$route.name
            },
            addViewTags() {
                const route = this.generateRoute()

                if (!route||route.path==='/'||route.path==='/login') {
                    return false
                }
                this.$store.dispatch('addVisitedViews', route)
            },
            moveToCurrentTag() {
                const tags = this.$refs.tag
                this.$nextTick(() => {
                    for (const tag of tags) {
                        if (tag.to === this.$route.path) {
                            this.$refs.scrollPane.moveToTarget(tag.$el)
                            break
                        }
                    }
                })
            },
            closeSelectedTag(view) {
                this.$store.dispatch('delVisitedViews', view).then((views) => {
                    if (this.isActive(view)) {
                        const latestView = views.slice(-1)[0]
                        if (latestView) {
                            this.$router.push(latestView.path)
                        } else {
                            this.$router.push('/')
                        }
                    }
                })
            },
            closeOthersTags() {
                this.$router.push(this.selectedTag.path)
                this.$store.dispatch('delOthersViews', this.selectedTag).then(() => {
                    this.moveToCurrentTag()
                })
            },
            closeAllTags() {
                this.$store.dispatch('delAllViews')
                this.$router.push('/')
            },
            openMenu(tag, e) {
                this.visible = true
                this.selectedTag = tag
                this.left = e.clientX-parseInt(this.$store.state.leftmenu.width)
                this.top = e.clientY-this.$$appConfig.layout.headerHeight
            },
            closeMenu() {
                this.visible = false
            }
        }
    }
</script>

<style lang="css" scoped>


    .tags-view-container .tags-view-wrapper {
        background: #fff;
        height: 34px;
        border-bottom: 1px solid #d8dce5;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);
    }
    .tags-view-container .tags-view-wrapper .tags-view-item {
        display: inline-block;
        position: relative;
        height: 26px;
        line-height: 26px;
        border: 1px solid #d8dce5;
        color: #495060;
        background: #fff;
        padding: 0 8px;
        font-size: 12px;
        margin-left: 5px;
        margin-top: 4px;
    }
    .tags-view-container .tags-view-wrapper .tags-view-item:first-of-type {
        margin-left: 15px;
    }
    .tags-view-container .tags-view-wrapper .tags-view-item.active{
        background-color: #42b983;
        color: #fff;
        border-color: #42b983;
    }
    .tags-view-container .tags-view-wrapper .tags-view-item.active::before {
        content: '';
        background: #fff;
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        position: relative;
        margin-right: 2px;
    }
    .tags-view-container .contextmenu {
        margin: 0;
        background: #fff;
        z-index: 999;
        position: absolute;
        list-style-type: none;
        padding: 5px 0;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 400;
        color: #333;
        -webkit-box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
        box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
    }
    .tags-view-container .contextmenu>li {
        margin: 0;
        padding: 7px 16px;
        cursor: pointer;
    }
    .tags-view-container .contextmenu>li:hover {
        background: #eee;
    }


    a, a:focus, a:hover {
        cursor: pointer;
        text-decoration: none;
    }

</style>

<style  lang="css">

    .tags-view-item .el-icon-close {
        width: 16px;
        height: 16px;
        vertical-align: 2px;
        border-radius: 50%;
        text-align: center;
        transition: all .3s cubic-bezier(.645, .045, .355, 1);
        -webkit-transform-origin: 100% 50%;
        transform-origin: 100% 50%;
    }
    .tags-view-item .el-icon-close:before {
        -webkit-transform: scale(.6);
        transform: scale(.6);
        display: inline-block;
        vertical-align: -3px;
    }
    .tags-view-item .el-icon-close:hover {
        background-color: #b4bccc;
        color: #fff;
    }

</style>
