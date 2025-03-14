<script setup>
import Sidebar from "./components/Sidebar.vue";
</script>

<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-title>QuickSecure</v-app-bar-title>
    </v-app-bar>

    <v-container fluid class="d-flex">
      <!-- Sidebar -->
      <Sidebar/>

      <!-- Main Content -->
      <v-main class="pa-5">
        <router-view/>
      </v-main>
    </v-container>
  </v-app>
</template>

<style scoped>

</style>
