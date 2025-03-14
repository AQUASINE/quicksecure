import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import HomePage from "./pages/HomePage.vue";
import {createRouter, createWebHistory} from "vue-router";
import {createPinia} from "pinia";
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'
import IncidentsPage from "./pages/IncidentsPage.vue";
import OrganizationsPage from "./pages/OrganizationsPage.vue";
import CreateIncidentPage from "./pages/CreateIncidentPage.vue";
import CreateOrganizationPage from "./pages/CreateOrganizationPage.vue";
import piniaPluginPersistedState from 'pinia-plugin-persistedstate';
import { useUserStore, useIncidentsStore, useOrganizationsStore, useUiStore } from "./store.js";
import {userManager} from "./helper/signin.js";

const routes = [
    { path: '/', component: HomePage },
    { path: '/incidents', component: IncidentsPage },
    { path: '/organizations', component: OrganizationsPage },
    { path: '/incidents/new', component: CreateIncidentPage },
    { path: '/organizations/new', component: CreateOrganizationPage }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

const vuetify = createVuetify({
    components,
    directives,
    theme: {
        dark: true,
    },
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi
        }
    }
})

const pinia = createPinia();
pinia.use(piniaPluginPersistedState);

userManager.signinCallback().then(async (user) => {
    const userStore = useUserStore();
    console.log('Sign In Callback', user)
    userStore.profile = user.profile;
    userStore.accessToken = user.access_token;
    userStore.idToken = user.id_token;
    userStore.refreshToken = user.refresh_token;

    const incidentsStore = useIncidentsStore();
    await incidentsStore.fetchIncidents();

    const organizationsStore = useOrganizationsStore();
    await organizationsStore.fetchOrganizations();

    const uiStore = useUiStore();
    uiStore.loading = false;
}).catch(async (error) => {
    console.log('Sign In Callback Not Successful');
    await userManager.signinRedirect();
})

const app= createApp(App);

app.use(vuetify);
app.use(router);
app.use(pinia);

app.mount('#app');
