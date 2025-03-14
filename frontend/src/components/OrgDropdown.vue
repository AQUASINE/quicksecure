<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {useOrganizationsStore} from "../store.js";

const store = useOrganizationsStore();
const router = useRouter();
const selectedOrganization = ref(null);

onMounted(async () => {
  await store.fetchOrganizations();
});

const organizations = store.organizations;

const onOrganizationChange = (orgId) => {
  store.selectOrganization(orgId);
};

const createOrganization = () => {
  router.push('/create-organization');
};
</script>>

<template>
  <v-select
      v-model="selectedOrganization"
      :items="organizations"
      item-title="orgName"
      item-value="orgId"
      label="Select Organization"
      @update:modelValue="onOrganizationChange"
  >
    <template v-slot:append-item>
      <v-divider />
      <v-list-item @click="createOrganization">+ Create Organization</v-list-item>
    </template>
  </v-select>
</template>

<style scoped>

</style>