<script setup>
import { ref, onBeforeMount } from 'vue'
import { getSensorData } from '../api/sensors.api';
import Spinner from '../components/Spinner.vue';
import LineChartBasic from '../components/LineChartBasic.vue';
import HeaderLayout from "../layouts/headerViewsLayout.vue";
import SimpleDonut from '../components/SimpleDonut.vue';
import TemporalityFilter from '../components/TemporalityFilter.vue';
import LineChart from '../components/LineChart.vue';
import { useQuasar } from 'quasar';

const $q = useQuasar()
let dataWeighing = ref([])
let battery = ref([])
let loading = ref(false)
let sensorDb = ref({})

onBeforeMount(async () => {
  await getData()
})

async function dataTemporality({ valor, type }) {
  dataWeighing.value = []
  await getData(type, valor)
};

async function getData(type = 'h', value = 6) {
  loading.value = true
  const { data, sensor } = await getSensorData('bascula', type, value)
  sensorDb.value = sensor

  if (data && data.length > 0) {
    dataWeighing.value = data.map((item) => {
      return {
        name: item.shortDate + '-' + item.hour,
        m: (parseFloat(item?.m) || 0).toFixed(1),
        b: (parseFloat(item?.b) || 0).toFixed(1),
        chf: (parseFloat(item?.chf) || 0).toFixed(1),
      }
    })

    battery.value = [{ name: 'Batería Restante', data: data }]
  }
  loading.value = false
}

</script>

<template>

  <div class="row col-12 row justify-center flex">
    <div class="col-12">
      <HeaderLayout title="Báscula" />
    </div>
    <q-page-sticky :position="$q.screen.width < 600 ? 'bottom' : 'top-right'
      " :offset="[30, 18]">
      <div class="sensor q-px-md bg-grey-13 rounded-borders">
        <q-icon name="scale" class="q-pr-sm" />
        {{ sensorDb?.name }}
      </div>
    </q-page-sticky>
    <div class="col-12">
      <TemporalityFilter @temporality="dataTemporality"></TemporalityFilter>
    </div>
  </div>
  <div class="row justify-center" v-if="dataWeighing.length > 0 || loading">
    <div class="col-12 col-md-6">
      <LineChartBasic v-if="dataWeighing.length > 0" :data="dataWeighing.map((item) => parseFloat(item.m))"
        :categories="dataWeighing.map((item) => item.name)" name="Peso" title="Masa" symbolLabel="g" />
    </div>
    <div class="col-12 col-md-6">
      <LineChartBasic v-if="dataWeighing.length > 0" :data="dataWeighing.map((item) => parseFloat(item.chf))"
        :categories="dataWeighing.map((item) => item.name)" name="Humedad" title="Humedad final" symbolLabel="%" />
    </div>
    <div class="col-12 justify-md-center justify-center" :class="{ 'flex': $q.screen.width < 600 }">
      <LineChart v-if="dataWeighing?.length > 0"
        :data="[{ name: 'Batería Restante', data: battery[0].data.map((item) => parseFloat(item.b)) }]"
        :labels="battery[0].data.map((item) => item.hour)" :colors="['#f3f3f3', 'transparent']" title="Batería" />
      <!-- <SimpleDonut v-if="dataWeighing?.length > 0" :data="battery[0].data.map((item) => parseFloat(item.b))"
        :labels="battery[0].data.map((item) => item.hour)" :colors="['#008FFB', '#d3d3d3']" title="Batería" /> -->
    </div>
  </div>
  <div v-else class="justify-center flex row">
    <h6 class="col-12 text-green-10 justify-center text-center flex">No se encontraron datos sobre la Báscula</h6>
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
