<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="d-flex justify-space-between">
        <h1>Incidents</h1>
        <v-btn color="primary" to="/incidents/new">
          <v-icon left>mdi-plus</v-icon>
          New Incident
        </v-btn>
      </v-col>
    </v-row>

      <IncidentCard v-for="incident in incidents" :key="incident.id" :incident="incident" />
  </v-container>
</template>

<script setup>
import {ref, onMounted, watch} from 'vue';
import { useIncidentsStore } from '../store';
import IncidentCard from "../components/IncidentCard.vue"; // Pinia store

const incidentsStore = useIncidentsStore();
const incidents = ref(incidentsStore.incidents);
const newUpdate = ref('');

const fetchIncidents = async () => {
  await incidentsStore.fetchIncidents();
  incidents.value = incidentsStore.incidents;
};

const toggleDetails = (id) => {
  expandedIncident.value = expandedIncident.value === id ? null : id;
};

const addUpdate = async (incidentId) => {
  if (!newUpdate.value.trim()) return;
  await incidentsStore.addIncidentUpdate(incidentId, newUpdate.value);
  newUpdate.value = '';
  await fetchIncidents();
};

watch(incidentsStore, () => {
  incidents.value = incidentsStore.incidents;
});

onMounted(fetchIncidents);
</script>
