<script setup>
import {userManager, signOutRedirect} from "../helper/signin.js";
import {onMounted, ref} from "vue";
import {useIncidentsStore, useUserStore} from "../store.js";
import * as d3 from 'd3';

const userStore = useUserStore()
const incidentStore = useIncidentsStore();

const chart = ref(null);



const signIn = async () => {
  console.log('Sign In')
  await userManager.signinRedirect();
}



onMounted(async () => {
  await incidentStore.fetchIncidents();
  renderChart();
})

const renderChart = () => {
  const data = incidentStore.incidents.map(d => ({ date: new Date(d.startTime * 1000), value: 1 }));

  console.log(data);

  const svg = d3.select(chart.value)
      .attr("width", 600)
      .attr("height", 250)
      .attr("viewBox", [0, -20, 600, 230]);

  // plot incidents started by month
  const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([40, 560]);

  const histogram = d3.histogram()
      .value(d => d.date)
      .domain(x.domain())
      .thresholds(x.ticks(d3.timeMonth));

  const bins = histogram(data);

  const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .nice()
      .range([200, 0]);

  svg.append("g")
      .attr("fill", "steelblue")
    .selectAll("rect")
    .data(bins)
    .join("rect")
      .attr("x", d => x(d.x0) + 1)
      .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
      .attr("y", d => y(d.length))
      .attr("height", d => y(0) - y(d.length));

  const axisBottom = d3.axisBottom(x)
      .ticks(d3.timeMonth)
      .tickFormat(d3.timeFormat("%b %Y"));

  svg.append("g")
      .call(axisBottom)
      .attr("transform", "translate(0,200)");

  // only show whole numbers on the y-axis, but allow d3 to decide how many ticks to show
  // don't show a tick more than once though
  const axisLeft = d3.axisLeft(y)
      .ticks(5)
      .tickFormat(d3.format("d"));



  svg.append("g")
      .call(axisLeft)
      .attr("transform", "translate(40,0)");

  svg.node();

};
</script>

<template>
  <div>
    <h1>
      Home
    </h1>
    <v-container>
      <h2>Incident Statistics</h2>
      <svg ref="chart"></svg>
      <p>This is the number of incidents reported by month in 2025.</p>
    </v-container>
  </div>
</template>

<style scoped>

</style>