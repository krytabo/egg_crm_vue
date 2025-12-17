import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./index.css";
import "./styles/style.css";
import "virtual:svg-icons-register";
import SvgIcon from "./components/SvgIcon.vue";

import { PerfectScrollbarPlugin } from "vue3-perfect-scrollbar";
import "vue3-perfect-scrollbar/style.css";
import i18n from "./plugins/i18n";

const app = createApp(App);
const pinia = createPinia();

import JsonViewer from "vue3-json-viewer";
import "vue3-json-viewer/dist/vue3-json-viewer.css";

app.component("SvgIcon", SvgIcon);
app.component("svg-icon", SvgIcon);

app.use(pinia);
app.use(router);
app.use(i18n);
app.use(PerfectScrollbarPlugin);
app.use(JsonViewer);
app.mount("#app");
