import Vue from 'vue'
import App from './App.vue'

if (process.env.NODE_ENV === 'development') {
  Vue.config.productionTip = process.env.VUE_APP_PRODUCTION_TIP === 'true'
}

new Vue({
  render: h => h(App),
}).$mount('#app')
