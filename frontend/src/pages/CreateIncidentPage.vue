<template>
  <v-container>
    <h2>Create a New Incident</h2>
    <v-form @submit.prevent="submitIncident">
      <v-text-field v-model="title" label="Title" required></v-text-field>
      <v-textarea v-model="description" label="Description" required></v-textarea>

      <v-select v-model="severity" :items="['Very Low', 'Low', 'Medium', 'High', 'Very High']" label="Severity"
                required></v-select>
      <v-select v-model="urgency" :items="[1, 2, 3, 4, 5]" label="Urgency" required></v-select>
      <v-btn type="submit" color="primary">Create</v-btn>
    </v-form>
  </v-container>
</template>

<script setup>
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import {createIncident} from "../api/api.js";
import {useOrganizationsStore} from "../store";

const severity = ref("Medium");
const urgency = ref(1);

const mapSeverity = {
  'Very Low': 1,
  'Low': 2,
  'Medium': 3,
  'High': 4,
  'Very High': 5,
};

const title = ref('');
const description = ref('');
const status = ref('Open');
const router = useRouter();
const organizationsStore = useOrganizationsStore();

const submitIncident = async () => {
  const now = new Date();
  await createIncident({
    title: title.value,
    description: description.value,
    severity: mapSeverity[severity.value],
    urgency: urgency.value,
    startTime: now.getTime() / 1000,
    organization: organizationsStore.selectedOrganization,
  });
  router.push('/incidents');
};


</script>