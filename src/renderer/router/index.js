import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/homePage/index.vue'
import Fenshi from '@/components/fenshi/index.vue'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            component: Home
        }, {
            path: '/fenshi',
            component: Fenshi
        }, {
            path: '*',
            redirect: '/'
        }
    ]
})
