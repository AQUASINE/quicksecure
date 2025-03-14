<script setup>
import {ref, defineProps} from "vue";
import {useIncidentsStore} from "../store";

const {incident} = defineProps(['incident']);

const incidentsStore = useIncidentsStore();

const expanded = ref(false);
const newUpdate = ref('');
const updateTitle = ref('');

const toggleDetails = () => {
  expanded.value = !expanded.value;
};

const formatDate = (unixTimestamp) => {
  // time is a number in unix time, so we need to convert it to a Date object
  if (!unixTimestamp) {
    return 'Ongoing';
  }
  const date = new Date(unixTimestamp * 1000);
  return date.toLocaleString();
};

const addUpdate = async (incidentId) => {
  if (!newUpdate.value.trim()) return;
  await incidentsStore.addUpdateToIncident(incidentId, updateTitle.value, newUpdate.value);
  newUpdate.value = '';
  updateTitle.value = '';
  await incidentsStore.fetchIncidents();
};
</script>

<template>
  <v-col cols="4" md="6" lg="12">
    <v-card>
      <v-card-title>{{ incident.title }}</v-card-title>
      <v-card-subtitle>{{ formatDate(incident.startTime) }} - {{ formatDate(incident.endTime) }}</v-card-subtitle>
      <v-card-text>
        {{ incident.description }}
      </v-card-text>
      <v-card-actions>
        <v-btn @click="toggleDetails()" text>View Details</v-btn>
      </v-card-actions>

      <v-expand-transition>
        <div v-if="expanded">
          <v-divider></v-divider>
          <v-card-text>
            <h4>Updates</h4>
            <ul class="list__card">
              <li v-for="update in incident.updates" :key="update.id">
                <h5> {{ update.title }}</h5>
                {{ update.content }} - <small>{{ formatDate(update.updatedTime) }}</small>
              </li>
            </ul>

            <v-text-field v-model="updateTitle" label="Update Title"></v-text-field>
            <v-textarea v-model="newUpdate" label="Add an update"></v-textarea>
            <v-btn color="primary" @click="addUpdate(incident.incidentId)">Submit Update</v-btn>
          </v-card-text>
        </div>
      </v-expand-transition>
    </v-card>
  </v-col>
</template>

<style scoped>
.list__card {
  padding: 5px 20px;
}
</style>