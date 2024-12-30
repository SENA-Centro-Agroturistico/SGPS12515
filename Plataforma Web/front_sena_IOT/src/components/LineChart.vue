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
      text: title,
      align: 'center',
    },
    labels: labels,
    responsive: [{
      breakpoint: 1000,
      options: {
        legend: {
          position: 'bottom'
        },
        xaxis:{
          tickAmount: 4
        }
      }
    }],

    xaxis: {
      categories: labels,
      labels: {
        rotate: 0,
        hideOverlappingLabels: true,
        style: {
          fontSize: '12px',
        }
      },
      tickAmount: 10,
      // min: labels.length>20 ? labels.length-20 : 0,
      // max: labels.length,
    },
    markers: {
      size: 1,
      colors: ['#008ffb'],
      strokeColors: '#008ffb',
      strokeWidth: 2,
      hover: {
        sizeOffset: 3
      }
    }
  }
}

</script>

<template>
  <div v-if="data.length > 0" id="chart" class="q-ma-xl">
    <apexchart type="line" height="350" :options="chartOptions" :series="series"></apexchart>

  </div>
  <div v-else class="justify-center flex">
    <h5 class="read-the-docs">Sin datos para mostrar</h5>
  </div>

</template>