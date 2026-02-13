import { createApp } from 'vue';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'pev2/dist/pev2.css';
import App from './App.vue';

document.title = browser.runtime.getManifest().name ?? '';

createApp(App).mount('#app');
