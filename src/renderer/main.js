import 'element-ui/lib/theme-chalk/index.css'
import Vue from 'vue'
import axios from 'axios'
import VueElectron from 'vue-electron'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import App from './App'
import HighchartsVue from 'highcharts-vue'

Vue.use(ElementUI)
Vue.use(HighchartsVue)
if (!process.env.IS_WEB) Vue.use(VueElectron)
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
    components: { App },
    router,
    store,
    template: '<App/>'
}).$mount('#app')
