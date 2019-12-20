import {utils} from "../../utils/utils";

export default {
    components: {},

    props: {
        rightPanelWidth: {
            type: Number
        },
        toggleStatus: {
            type: String,
            default: 'open',
            required: false
        },
        hasTitle: {
            type: Boolean,
            default: true
        },
        marginWidth: {
            type: Number,
            default: 8
        },
        hasBorder: {
            type: Boolean,
            default: true
        }
    },

    data() {
        return {
            win_size: {
                height: '',
            },
            status: this.toggleStatus,
            toggle: this.$$appConfig.layout.rightPanel.toggle,
            panelHeight: 80
        }
    },

    methods: {

        setSize() {
            this.$nextTick(() => {
                this.panelHeight = this.$$lib_$("#form-content-wrap").height();
                if (this.$refs.panelElScrollBar) this.$refs.panelElScrollBar.update();
            });
        },

        toggleMenu() {
            this.status = this.status === 'open' ? 'close' : 'open';
            this.$emit('togglePanel', this.status);
            this.$root.eventBus.$emit('toggleMenu');
        },
    },


    created() {
        this.$$lib_$(window).resize(() => {
            this.setSize();
        });
    },

    mounted() {
        this.panelHeight = this.$$lib_$("#form-content-wrap").height();
        if (this.$refs.panelElScrollBar) this.$refs.panelElScrollBar.update();
    },

    activated(){
        this.setSize();
    }

}
