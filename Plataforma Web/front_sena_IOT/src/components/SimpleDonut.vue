<script setup>
import { ref, onBeforeMount, defineProps, watch } from 'vue'
import ApexCharts from 'apexcharts'

let series = ref([])
let chartOptions = ref({})
const { data, labels,colors, title } = defineProps(['data', 'labels', 'colors', 'title'])

onBeforeMount(async () => {
  await setConfig()
})

const setConfig = async () => {
  series.value = data

  chartOptions.value = {
    chart: {
      type: 'donut',
    },
    title: {
      text: title,
      align: 'center',
    },
    labels: labels,
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  }

  if (colors) {
    chartOptions.value.colors = colors
  }
}

</script>

<template>
  <div v-if="data.length > 0" id="chart" class="q-ma-xl">
    <apexchart apexchart type="donut" height="350" :options="chartOptions" :series="series"></apexchart>
  </div>
  <div v-else class="justify-center flex">
    <h5 class="read-the-docs">Sin datos para mostrar</h5>
  </div>

</template>