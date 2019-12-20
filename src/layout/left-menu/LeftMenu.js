
import {
    gbs
} from 'config/';

export default {
    name: 'left-menu',
    data() {

        return {
            menu_list: [],
            win_size: {
                height: '',
            },
            leftWidth: 0,
            iconSize: '14px',
            headerHt: this.$$appConfig.layout.headerHeight,
            footerHt: this.$$appConfig.layout.footerHeight,
            access:gbs.access,
            env:process.env['NODE_ENV']


        }
    },
    methods: {
        setSize() {
            this.win_size.height = this.$$lib_$(window).height() + "px";
        },
        toggleMenu() {
            this.$store.dispatch(this.$store.state.leftmenu.menu_flag ? 'set_menu_close' : 'set_menu_open');
            this.leftWidth = this.$store.state.leftmenu.width;
            this.iconSize = this.$store.state.leftmenu.menu_flag ? '14px' : '15px';
            this.$root.eventBus.$emit('toggleMenu');
        },
        updateCurMenu(rt) {
            let route = rt || this.$route;
            if (route.matched.length) {
                let rootPath = route.matched[0].path,
                    fullPath = route.path;
                this.$store.dispatch('set_cur_route', {
                    rootPath,
                    fullPath
                });
                let routes = this.$router.options.routes;
                for (let i = 0; i < routes.length; i++) {
                    if (routes[i].path === rootPath && !routes[i].hidden) {
                        this.menu_list = routes[i].children;
                        break;
                    }
                }

                if (this.$$appConfig.layout.model === "top" || (this.menu_list[0].isFullPage&&this.menu_list.length === 1 && !this.menu_list[0].children)) {
                    this.leftWidth = '0px';
                } else {
                    this.leftWidth = this.$store.state.leftmenu.width;
                }
            } else {
                this.$router.push('/404');
            }
        }
    },
    created() {

        this.setSize();
        this.$$lib_$(window).resize(() => {
            this.setSize();
        });
        this.updateCurMenu();

    },

    computed:{
        menuWidth(){
            return this.$store.state.leftmenu.width;
        }
    },
    mounted() {
        // console.log(this.$store.state.user.userinfo.access);
    },
    watch: {
        $route(to, from) {
            this.updateCurMenu(to);
        }
    }
}
