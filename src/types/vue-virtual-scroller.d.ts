declare module 'vue-virtual-scroller' {
    import type { Component } from 'vue'

    export const DynamicScroller: Component
    export const DynamicScrollerItem: Component

    const plugin: {
        DynamicScroller: Component
        DynamicScrollerItem: Component
    }

    export default plugin
}
