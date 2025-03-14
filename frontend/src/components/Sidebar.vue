<script setup>

import OrgDropdown from "./OrgDropdown.vue";
</script>

<template>
  <v-navigation-drawer app>
    <v-list>
      <v-list-item>
        <OrgDropdown />
      </v-list-item>
      <v-list-item link to="/">Home</v-list-item>
      <v-list-item link to="/incidents">Incidents</v-list-item>
      <v-list-item link to="/organizations">Organizations</v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped>

</style>