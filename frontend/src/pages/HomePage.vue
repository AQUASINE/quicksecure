<script setup>
import {userManager, signOutRedirect} from "../helper/signin.js";
import {onMounted, ref} from "vue";
import {useIncidentsStore, useUserStore} from "../store.js";
import * as d3 from 'd3';

const userStore = useUserStore()
const incidentStore = useIncidentsStore();

const chart = ref(null);

userManager.signinCallback().then((user) => {
  console.log('Sign In Callback', user)
  userStore.profile = user.profile;
  userStore.accessToken = user.access_token;
  userStore.idToken = user.id_token;
  userStore.refreshToken = user.refresh_token;
}).catch((error) => {
  console.log('Sign In Callback Not Successful')
})

const signIn = async () => {
  console.log('Sign In')
  await userManager.signinRedirect();
}

const signOut = async () => {
  console.log('Sign Out')
  await signOutRedirect();
}

onMounted(async () => {
  await incidentStore.fetchIncidents();
  renderChart();
})

const renderChart = () => {
  const data = incidentStore.incidents.map(d => ({ date: new Date(d.startTime), value: 1 }));

  const svg = d3.select(chart.value)
      .attr("width", 600)
      .attr("height", 300);

  const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([0, 600]);

  const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([300, 0]);

  svg.append("g")
      .call(d3.axisBottom(x))
      .attr("transform", "translate(0,300)");

  svg.append("g")
      .call(d3.axisLeft(y));

  svg.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x(d.date))
      .attr("y", d => y(d.value))
      .attr("width", 5)
      .attr("height", d => 300 - y(d.value))
      .attr("fill", "steelblue");
};
</script>

<template>
  <div>
    <h1>
      Quicksecure
    </h1>
    <p>
      <v-icon icon="mdi-home" />
      This is the main page of Quicksecure. I will need to add:
    </p>
    <ul>
      <li>Incident Forms</li>
      <li>Incident List</li>
      <li>Stats</li>
      <li>Sidebar</li>
    </ul>
    <v-container>
      <h1>Incident Statistics</h1>
      <svg ref="chart"></svg>
    </v-container>
    <button @click="signIn">
      Sign In
    </button>
    <button @click="signOut">
      Sign Out
    </button>
  </div>
</template>

<style scoped>

</style>