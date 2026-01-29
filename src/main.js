import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import '@/assets/styles/style.css';
import './index.css';
import 'virtual:svg-icons-register';
import SvgIcon from './components/SvgIcon.vue';

import { PerfectScrollbarPlugin } from 'vue3-perfect-scrollbar';
import 'vue3-perfect-scrollbar/style.css';
import i18n from '@/assets/Language/i18n.js';

import NutUI from '@nutui/nutui';
import '@nutui/nutui/dist/style.css';

import { IonicVue } from '@ionic/vue';
import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

const app = createApp(App);
const pinia = createPinia();

import JsonViewer from 'vue3-json-viewer';
import 'vue3-json-viewer/dist/vue3-json-viewer.css';

app.component('SvgIcon', SvgIcon);
app.component('svg-icon', SvgIcon);

app.use(pinia);
app.use(router);
app.use(i18n);
app.use(PerfectScrollbarPlugin);
app.use(JsonViewer);
app.use(NutUI);
app.use(IonicVue, { mode: 'ios' });
app.mount('#app');
