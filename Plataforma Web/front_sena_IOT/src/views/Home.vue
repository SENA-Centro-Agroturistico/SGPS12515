<script setup>
import { ref, onBeforeMount } from 'vue'
import ApexCharts from 'apexcharts'
import { getSensorData } from '../api/sensors.api';

let dataTemperature = ref([])
let chartOptions = ref({})
let series = ref([])

onBeforeMount(async () => {
  const dataSensors = await getSensorData()
  console.log(dataSensors)
  dataTemperature.value = dataSensors.data['senaiot/aula22/co2'].temperature

  series.value = [{
    name: "Temperatura",
    data: dataTemperature.value.map((item) => item.value)
  }]

  chartOptions.value = {
    chart: {
      height: 350,
      type: 'line',
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'straight'
    },
    title: {
      text: 'Termometro',
      align: 'center'
    },
    grid: {
      row: {
        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
        opacity: 0.5
      },
    },
    xaxis: {
      categories: dataTemperature.value.map((item) => item.name),
    }
  }
})




</script>

<template>
  <div 
    v-if="dataTemperature.length > 0"
    id="chart"
    class="q-ma-xl"
    >
    <apexchart apexchart type="area" height="350" :options="chartOptions" :series="series"></apexchart>
  </div>
  <div v-else class="justify-center flex">
    <h5 class="read-the-docs">Sin datos para mostrar</h5>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
