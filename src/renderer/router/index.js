import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            component: () => import('@/components/homePage/index.vue')
        }, {
            path: '/fenshi',
            component: () => import('@/components/fenshi/index.vue')
        }, {
            path: '*',
            redirect: '/'
        }
    ]
})
