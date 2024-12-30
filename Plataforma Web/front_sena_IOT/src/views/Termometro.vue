<script setup>
import ColumnChart from '../components/ColumnChart.vue';
import LineChartBasic from '../components/LineChartBasic.vue';
import { ref, onBeforeMount } from 'vue'
import ApexCharts from 'apexcharts'
import { getSensorData } from '../api/sensors.api';
import Spinner from '../components/Spinner.vue'
import SimpleDonut from '../components/SimpleDonut.vue';
import { useQuasar } from 'quasar';
import HeaderLayout from "../layouts/headerViewsLayout.vue";
import TemporalityFilter from '../components/TemporalityFilter.vue';
import LineChart from '../components/LineChart.vue';

const $q = useQuasar();

let dataTermometro = ref([])
let battery = ref([])
let loading = ref(false)
let sensorDb = ref({})

onBeforeMount(async () => {
  await getData()

})

const getData = async () => {
  loading.value = true
  const {data, sensor} = await getSensorData('termometro')
  sensorDb.value = sensor
  if (data && data.length > 0) {

    dataTermometro.value = data.map((item) => {
      return {
        name: item.shortDate + '-' + item.hour,
        h: (parseFloat(item?.h) || 0).toFixed(1),
        b: (parseFloat(item?.b) || 0).toFixed(1),
        t: (parseFloat(item?.t) || 0).toFixed(1),
      }
    })

    battery.value = [{ name: 'Bateria Restante', data: data }]
  }
  loading.value = false
}

async function dataTemporality({ valor, type }) {
  dataTermometro.value = []
  await getData(type, valor)
};

</script>

<template>
  <div class="row col-12 row justify-center flex">
    <div class="col-12">
      <HeaderLayout title="Termometro"/>
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
  <div class="row justify-center" v-if="dataTemperature?.length > 0 || loading">
      <div class="col-12 col-md-6">
        <LineChartBasic v-if="dataTemperature?.length > 0"
          :data="dataTemperature.map((item) => parseFloat(item.value).toFixed(2))"
          :categories="dataTemperature.map((item) => item.name)" name="Nivel" title="Temperaturas" symbolLabel="°C" />
      </div>
      <div class="col-12 col-md-6">
        <LineChartBasic v-if="dataHumidity?.length > 0" :data="dataHumidity.map((item) => parseFloat(item.value).toFixed(2))"
          :categories="dataHumidity.map((item) => item.name)" name="Nivel" title="Humedad" symbolLabel="%"/>
  
      </div>
      <div class="col-12 justify-md-center justify-center"
      :class="{'flex': $q.screen.width < 600}">
      <LineChart v-if="dataHumidity?.length > 0" :data="[{ name: 'Bateria Restante', data: battery[0].data.map((item) => parseFloat(item.b)) }]"
        :labels="battery[0].data.map((item) => item.hour)" :colors="['#f3f3f3', 'transparent']" title="Bateria" />
        <!-- <SimpleDonut v-if="dataBattery?.length > 0" :data="dataDonut.map((item) => item.value)"
          :labels="dataDonut.map((item) => item.name)" 
          :colors="['#008FFB', '#d3d3d3']"
          title="Bateria"/> -->
      </div>
    </div>
    <div v-else class="justify-center flex row">
    <h6 class="col-12 text-green-10 justify-center text-center flex">No se encontraron datos sobre el Termometro</h6>
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
