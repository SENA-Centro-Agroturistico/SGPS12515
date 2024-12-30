import App from "./App.vue";
import { createApp } from "vue";
import { Quasar, Notify, Dialog, Loading } from "quasar";
import { createPinia } from "pinia";
import { createPersistedState } from "pinia-plugin-persistedstate";
import langEs from "quasar/lang/es.js";
import VueApexCharts from "vue3-apexcharts";
import { routes } from "./routes/routes";
import axios from 'axios'

import "@quasar/extras/fontawesome-v6/fontawesome-v6.css";
import "@quasar/extras/material-icons/material-icons.css";
import "@quasar/extras/material-icons-outlined/material-icons-outlined.css";
import "@quasar/extras/material-icons-round/material-icons-round.css";
import "@quasar/extras/material-icons-sharp/material-icons-sharp.css";
import "@quasar/extras/material-symbols-outlined/material-symbols-outlined.css";
import "@quasar/extras/material-symbols-rounded/material-symbols-rounded.css";
import "@quasar/extras/material-symbols-sharp/material-symbols-sharp.css";

import "quasar/src/css/index.sass";
import "./style.css";
import { createRouter } from "vue-router";
import { createWebHashHistory } from "vue-router";
import { createWebHistory } from "vue-router";

const app = createApp(App);

const pinia = createPinia();
pinia.use(
  createPersistedState({
    storage: localStorage,
  })
);

app.use(Quasar, {
  lang: langEs,
  plugins: {
    Notify,
    Dialog,
    Loading,
  },
});


const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

app.use(pinia);
app.use(VueApexCharts);
app.use(router);
app.mount("#app");


