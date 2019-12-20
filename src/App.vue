<template>
    <div id="app"
         v-loading="$store.state.global.ajax_loading"
         v-loading.fullscreen=false
         v-loading.fullscreen.lock=false
         element-loading-text="拼命加载中">
        <keep-alive>
            <router-view></router-view>
        </keep-alive>
        <!--<transition name="bounce">-->
    </div>
</template>

<script>
    import {
        dateUtils
    } from 'utils/dateUtils.js';

    export default {
        name: 'app',
        components: {},
        data() {
            return {}
        },
        methods: {
            init() {
                if (!this.$store.state.user.userinfo.token) {//不存在token
                    this.$router.push('/login');
                }
//                else if (this.$store.state.user.userinfo.web_routers.indexOf(to.path) === -1) //未授权访问
//                {
//
//                }
                else {//判断token是否已经过期
                    let expiresData = dateUtils.strToDate(this.$store.state.user.userinfo.token['.expires']);
                    let diff = dateUtils.dateDiff('n', new Date(), expiresData);
                    if (diff < 2) //有效时间大于两分钟
                        this.$router.push('/login');
                }
            }
        },
        mounted() {
            this.init();
        },
        activated() {
            this.init();
        },
        watch: {}
    }
</script>

<style lang="less">
    * {
        /*-webkit-box-sizing: border-box;*/
        /*-moz-box-sizing: border-box;*/
        /*box-sizing: border-box;*/
        margin: 0px;
        padding: 0px;
    }

    .bounce-enter-active {
        animation: bounce-in .5s;
        -webkit-animation: bounce-in .5s;
    }

    .bounce-leave-active {
        animation: bounce-out .2s;
        -webkit-animation: bounce-out .2s;
    }

    @keyframes bounce-in {
        0% {
            transform: scale(0);
        }
        50% {
            transform: scale(1.05);
        }
        100% {
            transform: scale(1);
        }
    }

    @keyframes bounce-out {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(0.95);
        }
        100% {
            transform: scale(0);
        }
    }
</style>
