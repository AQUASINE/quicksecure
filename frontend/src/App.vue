<script setup>
import Sidebar from "./components/Sidebar.vue";
import { useUiStore} from "./store.js";
import {signOutRedirect} from "./helper/signin.js";

const store = useUiStore();

const signOut = async () => {
  console.log('Sign Out')
  await signOutRedirect();
}
</script>

<template>
  <v-app v-if="!store.loading">
    <v-app-bar app color="primary" dark>
      <v-app-bar-title>QuickSecure</v-app-bar-title>
    </v-app-bar>

    <v-container fluid class="d-flex">
      <Sidebar/>

      <v-main class="container__router">
        <router-view/>
      </v-main>
    </v-container>
    <button @click="signOut" class="button__sign-out">
      Sign Out
    </button>
  </v-app>
  <div v-else class="container__progress">
    <v-progress-circular
        absolute
        color="blue"
        indeterminate
    ></v-progress-circular>
  </div>
</template>

<style scoped>

.button__sign-out {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 100000;
  border-radius: 4px;
  background-color: #dddddd;
}

.container__progress {
  height: 100vh;
  max-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.container__router {
  padding: 15px;
  width: 100vh;
  margin-top: 64px;
}

</style>
