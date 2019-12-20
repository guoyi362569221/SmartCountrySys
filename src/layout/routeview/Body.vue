<template>
	<div class="main-body">
		<header-nav></header-nav>
		<div class="left-fixed-right-auto">
			<left-control></left-control>
			<div class="right-content" :style="{'bottom':footerHt+'px'}">
			<tags-view class='tagsview' v-if='tagsviewShow' :style="{'top':headerHt+'px'}"></tags-view>
				<div class="content"  :style="{'top':headerHt+tagsviewHt+'px'}">
					<!--<bread></bread>-->
					<keep-alive>
						<router-view></router-view>
					</keep-alive>
				</div>
			</div>
			<!--<bootom-footer></bootom-footer>-->
		</div>
	</div>
</template>
<script>
	import HeaderNav from '../head-nav-v1/HeadNav.vue';
	import LeftControl from '../left-menu/LeftMenu.vue';
	import BootomFooter from '../footer/Module.vue';
    import TagsView from '../tagsview/TagsView.vue';

	export default {
		name: 'mainBody',
		components: {
			HeaderNav, LeftControl, BootomFooter,TagsView
		},
		data() {
			return {
				headerHt:this.$$appConfig.layout.headerHeight,
				footerHt:this.$$appConfig.layout.footerHeight,
				tagsviewShow:this.$$appConfig.layout.tagsView,
                tagsviewHt:this.$$appConfig.layout.tagsView?35:0
			}
		},


		activated: function () {
           this.$store.dispatch('set_menu_hide');
        },

        deactivated: function () {
            this.$store.dispatch('set_menu_show');
        },

		mounted(){
            this.$nextTick(() => {
//                this.$$lib_$(".main-body .content").mCustomScrollbar();
            });
		}
	}
</script>
<style scoped lang='less'>

	.content {
		position: absolute;
		left: 0;
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
