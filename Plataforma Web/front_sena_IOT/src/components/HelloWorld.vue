<script setup>
import { ref } from 'vue'
import ApexCharts from 'apexcharts'


  
      let series = ref([{
        name: "Desktops",
        data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
    }])

    let chartOptions = ref({
      chart: {
        height: 350,
        type: 'line',
        zoom: {
          enabled: true
        }
      },
      dataLabels: {
        enabled: true
      },
      stroke: {
        curve: 'straight'
      },
      title: {
        text: 'Product Trends by Month',
        align: 'center'
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
          opacity: 0.5
        },
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      }
    })
    
</script>

<template>
  <div id="chart">
        <apexchart type="line" height="350" :options="chartOptions" :series="series"></apexchart>
      </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
