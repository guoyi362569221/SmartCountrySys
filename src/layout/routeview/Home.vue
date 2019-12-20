<template>
    <div class="home">
        <header-nav></header-nav>
        <div class="left-fixed-right-auto">
            <left-menu></left-menu>
            <div class="right-content" :style="{'bottom':footerHt+'px'}">
            <tags-view class='tagsview' v-if='tagsviewShow' :style="{left:model=='top'?'0px':$store.state.leftmenu.width,'top':headerHt+'px'}"></tags-view>
                <div class="content" :style="{left:model=='top'?'0px':$store.state.leftmenu.width,'top':headerHt+tagsviewHt+'px'}">
                    <!--<bread></bread>-->
                    <!-- <tags-view></tags-view> -->
                    <keep-alive>
                        <router-view></router-view>
                    </keep-alive>
                </div>
            </div>
            <!-- <bootom-footer></bootom-footer> -->
        </div>
    </div>
</template>
<script>
    import HeaderNav from '../head-nav-v1/HeadNav.vue';
    import LeftMenu from '../left-menu/LeftMenu.vue';
    import BootomFooter from '../footer/Module.vue';
    import TagsView from '../tagsview/TagsView.vue';
    export default {
        name: 'home',
        components: {
            HeaderNav, LeftMenu, BootomFooter,TagsView
        },
        data() {
            return {
                headerHt: this.$$appConfig.layout.headerHeight,
                footerHt: this.$$appConfig.layout.footerHeight,
                model: this.$$appConfig.layout.model||'top',
                tagsviewShow:this.$$appConfig.layout.tagsView,
                tagsviewHt:this.$$appConfig.layout.tagsView?35:0
            }
        }
    }
</script>
<style scoped lang='less'>


    .content {
        position: absolute;
        right: 0;
        bottom: 0;
        overflow: auto;
        color:#3d3a38;
        font-size: 14px;
    }

.tagsview{
        position: relative;
    }

    .right-content {
        position: absolute;
        /*bottom: 40px;*/
        top: 0;
        left: 0;
        right: 0;
        /*margin-bottom: 60px;*/
    }
</style>
