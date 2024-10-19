import { createApp } from 'vue'
//import { createBootstrap } from 'bootstrap-vue-next'
import './assets/global.css' 

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'
import 'bootstrap';
import 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.mount('#app')
