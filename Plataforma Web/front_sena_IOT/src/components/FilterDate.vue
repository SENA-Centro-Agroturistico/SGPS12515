<script setup>
import { ref } from "vue";

//Configurar gráfico
const data = [
  {
    x: "02-02-2024",
    y: 44,
  },
  {
    x: "03-02-2024",
    y: 53,
  },
  {
    x: "04-02-2024",
    y: 45,
  },
  {
    x: "05-02-2024",
    y: 33,
  },
  {
    x: "06-02-2024",
    y: 21,
  },
  {
    x: "12-02-2024",
    y: 51,
  },
];
const series = ref([{ data }]);
const chartOptions = ref({});
const chartRef = ref(null);

chartOptions.value = {
  chart: {
    height: 350,
    type: "line",
    zoom: {
      enabled: false,
    },
  },
  dataLabels: {
    enabled: true,
  },
  stroke: {
    curve: "straight",
  },
  grid: {
    row: {
      colors: ["#f3f3f3", "transparent"],
      opacity: 0.5,
    },
  },
  xaxis: {
    categories: ["primera", "segunda"],
  },
  yaxis: {
    labels: {
      formatter: function (val) {
        return val + " " + "hola";
      },
    },
  },
};

//Actualizar gráfico
function updateSeries() {
  series.value = [
    {
      data: [
        {
          x: "02-02-2020",
          y: 44,
        },
        {
          x: "12-02-2024",
          y: 51,
        },
      ],
    },
  ];

  if (chartRef.value) {
    chartRef.value.updateSeries([
      {
        data: [
          {
            x: "02-02-2020",
            y: 44,
          },
          {
            x: "12-02-2024",
            y: 51,
          },
        ],
      },
    ]);
  }
}

//Filtro fechas
const loadBtnFechas = false;
const desplegar = ref(false);
const info = ref(false);
const fechas = ref([]);
function filtrarPorFechas() {}
</script>

<template>
  <div id="chart">
    <div class="toolbar">
      <!-- Filtro fecha -->
      <div>
        <q-btn @click="desplegar = !desplegar">Filtrar</q-btn>
        <q-icon name="info" size="2rem" color="info" class="q-ml-sm">
          <q-tooltip v-model="info" style="text-align: center">
            Seleccione dos veces la misma fecha
            <br />
            o
            <br />
            Selecciones dos fechas distintas
          </q-tooltip>
        </q-icon>

        <div v-if="desplegar">
          <q-date v-model="fechas" range id="inputFecha">
            <div class="row items-center justify-end">
              <q-btn
                label="Filtrar"
                @click="filtrarPorFechas"
                :disable="!fechas"
                :loading="loadBtnFechas"
                color="primary"
                flat
              />
            </div>
          </q-date>
        </div>
      </div>
    </div>

    <!-- Gráfica -->
    <div id="chart-timeline">
      <apexchart
        type="area"
        height="350"
        ref="{chartRef}"
        :options="chartOptions"
        :series="series"
      ></apexchart>
    </div>
  </div>
</template>

<style scoped>
#chart {
  border: 1px solid rgb(229, 229, 229);
  margin: 2rem;
  padding: 1rem;
  box-shadow: rgb(229, 229, 229) 5px 5px 10px;
}

#inputFecha {
  position: absolute;
  left: 3rem;
  z-index: 100;
}
</style>
