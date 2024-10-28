import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import BootstrapVue3 from 'bootstrap-vue-3'

// Styles
import './assets/global.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css'

// Scripts
import 'jquery'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

const app = createApp(App)

// Plugins registrieren
app.use(BootstrapVue3)
app.use(router)

app.mount('#app')
