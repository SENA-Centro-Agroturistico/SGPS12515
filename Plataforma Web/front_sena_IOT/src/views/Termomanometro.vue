<script setup>
import ColumnChart from '../components/ColumnChart.vue';
import LineChartBasic from '../components/LineChartBasic.vue';
import { ref, onBeforeMount } from 'vue'
import ApexCharts from 'apexcharts'
import { getSensorData } from '../api/sensors.api';
import Spinner from '../components/Spinner.vue';
import HeaderLayout from "../layouts/headerViewsLayout.vue";
import SimpleDonut from '../components/SimpleDonut.vue';
import TemporalityFilter from "../components/TemporalityFilter.vue"
import LineChart from '../components/LineChart.vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();
let dataTermohigrometro = ref([])
let loading = ref(false)
let battery = ref([])
let sensorDb = ref({})

onBeforeMount(async () => {
  await getData()

})

async function getData(type = 'h', value = 6) {
  loading.value = true
  const {data, sensor} = await getSensorData('termohigrometro', type, value)
  sensorDb.value = sensor
  if (data && data.length > 0) {

    dataTermohigrometro.value = data.map((item) => {
      return {
        name: item.shortDate + '-' + item.hour,
        h: (parseFloat(item?.h) || 0).toFixed(1),
        b: (parseFloat(item?.b) || 0).toFixed(1),
        l: (parseFloat(item?.l) || 0).toFixed(1),
        t: (parseFloat(item?.t) || 0).toFixed(1),
        u: (parseFloat(item?.u) || 0).toFixed(1)
      }
    })

    battery.value = [{ name: 'Batería Restante', data: data }]
  }
  loading.value = false
}

async function dataTemporality ({valor, type}){
  dataTermohigrometro.value = []
  await getData(type, valor)
};

</script>

<template>
  <div class="row col-12 row justify-center flex">
    <div class="col-12">
      <HeaderLayout title="Termohigrómetro" />
    </div>
    <q-page-sticky :position="$q.screen.width < 600 ? 'bottom' : 'top-right'
      " :offset="[30, 18]">
      <div class="sensor q-px-md bg-grey-13 rounded-borders">
        <q-icon name="thermostat" class="q-pr-sm" />
        {{ sensorDb?.name }}
      </div>
    </q-page-sticky>
    <div class="col-12">
      <TemporalityFilter @temporality="dataTemporality"></TemporalityFilter>

    </div>
  </div>
  <div class="row justify-center" v-if="dataTermohigrometro.length > 0 || loading">
    <div class="col-12 col-md-6">
      <LineChartBasic v-if="dataTermohigrometro.length > 0"
        :data="dataTermohigrometro.map((item) => parseFloat(item.t).toFixed(2))"
        :categories="dataTermohigrometro.map((item) => item.name)" name="Nivel" title="Temperatura" symbolLabel="°C" />
    </div>
    <div class="col-12 col-md-6">
      <LineChartBasic v-if="dataTermohigrometro.length > 0"
        :data="dataTermohigrometro.map((item) => parseFloat(item.h).toFixed(2))"
        :categories="dataTermohigrometro.map((item) => item.name)" name="Nivel" title="Humedad" symbolLabel="%" />

    </div>
    <div class="col-12 col-md-6">
      <LineChartBasic v-if="dataTermohigrometro.length > 0" :data="dataTermohigrometro.map((item) => item.u)"
        :categories="dataTermohigrometro.map((item) => item.name)" name="Nivel" title="Radiación Ultravioleta"
        symbolLabel="W/m²" />
    </div>
    <div class="col-12 col-md-6">
      <LineChartBasic v-if="dataTermohigrometro.length > 0" :data="dataTermohigrometro.map((item) => item.l)"
        :categories="dataTermohigrometro.map((item) => item.name)" name="Nivel" title="Nivel de Iluminación"
        symbolLabel="lx" />
    </div>
    <div class="col-12 justify-md-center justify-center" :class="{ 'flex': $q.screen.width < 600 }">
      <!-- <SimpleDonut v-if="dataTermohigrometro?.length > 0" :data="battery.map((item) => parseFloat(item.value))"
        :labels="battery.map((item) => item.name)" :colors="['#008FFB', '#d3d3d3']" title="Batería" /> -->
        <LineChart v-if="dataTermohigrometro?.length > 0" :data="[{ name: 'Batería Restante', data: battery[0].data.map((item) => parseFloat(item.b)) }]"
          :labels="battery[0].data.map((item) => item.hour)" :colors="['#f3f3f3', 'transparent']" title="Batería" />
    </div>
  </div>
  <div v-else class="justify-center flex row">
    <h6 class="col-12 text-green-10 justify-center text-center flex">No se encontraron datos sobre el Termohigrómetro</h6>
    <div class="col-12 justify-center flex">
      <q-icon name="sentiment_very_dissatisfied" size="100px" class="text-green-10 justify-center text-center flex" />
    </div>
  </div>

  <Spinner v-if="loading" />
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
.sensor {
  font-size: 17px;
  font-weight: 700;
}
</style>
