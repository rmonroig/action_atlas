import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router.js'

import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
    onNeedRefresh() {
        // Show a prompt to user to refresh? For now, we rely on autoUpdate.
    },
    onOfflineReady() {
        console.log('App ready to work offline');
    },
});

createApp(App).use(router).mount('#app')
