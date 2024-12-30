<template>

  <div class="justify-center row q-my-lg">
    <div id="pdf" class="row items-center justify-center flex col-sm-12 col-md-9 col-lg-7 col-xl-7">
      <div class="col-12  text-center row">
        <div class="col-12 col-md-6 row justify-center flex">
          <q-img class="col-3 q-mx-lg" src="/images/logo.png" style="width: 80px; height: 80px;" />
          <div class="col-9 text-center">
            <p class="text-green-9" style="font-size: 1.5em;font-weight: 600;">SENA - {{ dates?.farm }}</p>
          </div>
        </div>
        <div class="col-12 col-md-6 justify-center items-center flex">
          <div class="col-12 text-center">
            <p style="font-size: 1.5em;">Reporte de datos</p>
            <p style="font-size: 1.3em;">
              {{ dates?.start }} - {{ dates?.end }}
            </p>
          </div>
        </div>
      </div>
      <div class="col-12 justify-center flex full-width">
        <q-markup-table dense wrap-cells id="tableReport">
          <thead class="header_table bg-green-1">
            <tr>
              <th class="text-center" style="font-weight: bold;font-size: .9rem;" v-for="column in columns"
                :key="column.name">
                {{ column.label }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white">
            <template v-for="month in data" :key="month.nameMonth" class="bg-white">
              <tr v-for="day in month.data" :key="day.date">
                <td v-for="column in columns" :key="column.name" class="text-center">
                  <template v-if="column.type === 'number'">
                    {{ (day[column.field]).toFixed(2) }} <span v-if="column.symbol">{{ column.symbol }}</span>
                  </template>
                  <template v-else-if="column.type === 'date'">
                    {{ new Date(day[column.field]).toLocaleDateString() }}
                  </template>

                  <template v-else>
                    {{ day[column.field] }} 
                    <span v-if="column.symbol">{{ column.symbol }}</span>
                  </template>

                </td>
              </tr>
              <!-- <tr class="bg-blue-grey-1" style="font-weight: bold;">
                <td class="text-center">Total {{ month.nameMonth }}</td>
                <td class="text-center">{{ (month.promedio.temperature || 0).toFixed(2) }} °C</td>
                <td class="text-center">{{ (month.promedio.humidity || 0).toFixed(2) }} %</td>
                <td class="text-center">{{ (month.promedio.u || 0).toFixed(2) }} W/m2</td>
                <td class="text-center">{{ (month.promedio.masa || 0).toFixed(2) }} g</td>
                <td class="text-center">{{ (month.promedio.humfinal || 0).toFixed(2) }} %</td>
              </tr> -->
            </template>
          </tbody>
        </q-markup-table>

      </div>
    </div>
  </div>

</template>

<script setup>
import { onMounted, ref, watch } from "vue";

const { dates, data } = defineProps(["dates", "data"]);
let dataHumedad = ref([])

onMounted(() => {
  //generar un array con todas las humedades finales de cada día 
  dataHumedad.value = data.map((month) => {
    return month.data.map((day) => {
      return {
        date: day.date,
        humfinal: day.humfinal
      }
    })
  }).flat()

  console.log(dataHumedad.value)
});

let columns = ref([
  {
    name: "date",
    label: "Fecha",
    field: "date",
    align: "center",
    sortable: true,
    type: "string",
  },
  {
    name: "temperature",
    label: "Temperatura final del día",
    field: "temperature",
    align: "center",
    sortable: true,
    type: "number",
    symbol: "°C"
  },
  {
    name: "humidity",
    label: "Humedad final del día",
    field: "humidity",
    align: "center",
    sortable: true,
    type: "number",
    symbol: "%"
  },
  {
    name: "masa",
    label: "Masa",
    field: "masa",
    align: "center",
    sortable: true,
    type: "number",
    symbol: "g"
  },
  {
    name: "humfinal",
    label: "Prom. Humedad final",
    field: "humfinal",
    align: "center",
    sortable: true,
    type: "number",
    symbol: "%"
  }
]);
</script>

<style scoped></style>