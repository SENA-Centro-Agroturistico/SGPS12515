
<script setup>
import { ref, onBeforeMount,defineProps,watch } from 'vue'
import ApexCharts from 'apexcharts'

let series = ref([])
let chartOptions = ref({})
const { data,categories,name,title, symbolLabel } = defineProps(['data','categories','name','title','symbolLabel'])

onBeforeMount(async () => {
  await setConfig()
})

const setConfig = async () => {
  series.value = [{
    name: name,
    data: data
  }]

  chartOptions.value = {
    chart: {
      height: 350,
      type: 'bar',
    },
    plotOptions: {
      bar: {
        borderRadius: 10,
        dataLabels: {
          position: 'top', // top, center, bottom
        },
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val + ' ' + symbolLabel;
      },
      offsetY: -20,
      style: {
        fontSize: '12px',
        colors: ["#304758"]
      }
    },

    xaxis: {
      categories: categories,
      position: 'top',
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      crosshairs: {
        fill: {
          type: 'gradient',
          gradient: {
            colorFrom: '#D8E3F0',
            colorTo: '#BED1E6',
            stops: [0, 100],
            opacityFrom: 0.4,
            opacityTo: 0.5,
          }
        }
      },
      tooltip: {
        enabled: true,
      }
    },
    yaxis: {
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false,
      },
      labels: {
        show: false,
        formatter: function (val) {
          return val + ' ' + symbolLabel;
        }
      }

    },
    title: {
      text: title,
      floating: true,
      offsetY: 330,
      align: 'center',
      style: {
        color: '#444'
      }
    }

  }
}

</script>

<template>
<div v-if="data.length > 0" id="chart" class="q-ma-xl">
    <apexchart type="bar" height="350" :options="chartOptions" :series="series"></apexchart>
  </div>
  <div v-else class="justify-center flex">
    <h5 class="read-the-docs">Sin datos para mostrar</h5>
  </div>

</template>