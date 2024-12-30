<script setup>
import { ref, onBeforeMount, defineProps, watch } from 'vue'
import ApexCharts from 'apexcharts'

let series = ref([])
let chartOptions = ref({})
const { data, categories, name, title,symbolLabel } = defineProps(['data', 'categories', 'name', 'title','symbolLabel'])

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
      type: 'line',
      toolbar:{
        offsetX: 10,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
          customIcons: []
        },
      },
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'straight'
    },
    title: {
      text: title,
      align: 'center'
    },
    grid: {
      row: {
        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
        opacity: 0.5
      },
    },
    xaxis: {
      categories: categories.map((item) => item.split('-')[1]),
      // min: categories.length>20 ? categories.length-20 : 0,
      // max: categories.length,
      labels: {
        rotate: 0,
        hideOverlappingLabels: true,
        style: {
          fontSize: '12px',
        }
      },
      tickAmount: 4,  
    },
    markers: {
      size: 2,
      colors: ['#008ffb'],
      strokeColors: '#008ffb',
      strokeWidth: 2,
      hover: {
        sizeOffset: 3
      }
    },
    yaxis: {
      labels: {
        formatter: function (val) {
          return parseFloat(val).toFixed(1) + ' ' + symbolLabel;
        }
      }
    },
    tooltip:{
      x:{
        formatter: function (val) {
          return categories[val-1]
        }
      }
    },
    annotations: {
    yaxis: [
      {
        y: Math.min(...data),  // Valor mínimo
        borderColor: '#FF0000',
        label: {
          text: 'Mínimo: ' + Math.min(...data),
          style: {
            color: '#FF0000',
            fontSize: '12px'
          }
        }
      },
      {
        y: Math.max(...data),  // Valor máximo
        borderColor: '#00FF00',
        label: {
          text: 'Máximo: ' + Math.max(...data),
          style: {
            color: '#00FF00',
            fontSize: '12px'
          }
        }
      }
    ]
  },
    responsive: [
    {
      breakpoint: 1000,
      options: {
        title: {
          align: "left"
        }
      }
    },
    {
      breakpoint: 800,
      options: {
        title: {
          align: "left"
        },
        dataLabels:{
          enabled:false
        },
      }
    },
  ]
  }
}

const screenWidth = ref(window.innerWidth>600 ? 'col-10' : 'col-12')
</script>

<template>
  <div v-if="data.length > 0" id="chart" class="q-ma-lg">
    <div class="row contGraphic">
      <div :class="screenWidth">
        <apexchart apexchart type="area" height="350" :options="chartOptions" :series="series" :id="name"></apexchart>
      </div>
      <div class="col-2 row last-value">
        <span class="title text-primary">{{title}}</span>
        <span>{{series[0].data[series[0].data.length-1] + " " + symbolLabel}}</span>
      </div>
    </div>
  </div>
  <div v-else class="justify-center flex">
    <h5 class="read-the-docs">Sin datos para mostrar</h5>
  </div>

</template>

<style scoped>
.contGraphic{
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  flex-direction: row;
}
.title{
  font-size: large;
  font-weight: bold;
}
.last-value{
  display: flex;
  flex-direction: column;
  align-content: center;
  text-align: center;
  padding: 1rem;

}

@media (max-width: 600px) {
  .contGraphic{
    flex-direction: column;
  }
}
</style>