<script setup>
import { ref, watch, onMounted } from "vue";
import HeaderLayout from "../layouts/headerViewsLayout.vue";
import { storeUsers } from "../stores/users.js";
import Report from "../components/Report.vue";
import { getReportPDF } from "../api/report.api.js";
import LineChartBasic from "../components/LineChartBasic.vue";
import { jsPDF } from "jspdf";
import { useQuasar } from "quasar";
import html2canvas from "html2canvas";

const $q = useQuasar();

const useUsers = storeUsers();
const load = ref({ farm: true, report: false });
const data = ref({ farm: "", fechaA: "", fechaB: "" });
const dataReport = ref([]);
//const generatePdf = ref(false);

const farms = ref([]);
onMounted(() => {
  load.value.farm = true;
  try {
    farms.value = useUsers.farms.map((farm) => {
      return {
        label: `${farm.codeFarm} - ${farm.name}`,
        value: farm._id,
      };
    });
  } catch (error) {
    console.log(error);
  } finally {
    load.value.farm = false;
  }
});

const farmsFilter = ref(farms.value);
function filterFnFarm(val, update) {
  val = val.trim();
  if (val === "") {
    update(() => {
      farmsFilter.value = farms.value;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    farmsFilter.value =
      farms.value.filter((v) => v.label.toLowerCase().indexOf(needle) > -1) ||
      [];
  });
}

function convertDate(date) {
  return date.replaceAll("/", "-");
}

const msgNoData = ref(false)
async function getReports() {
  dataReport.value = [];
  msgNoData.value = false
  load.value.report = true;
  try {
    const info = {
      farm: data.value.farm.value,
      fechaA: convertDate(data.value.fechaA),
      fechaB: convertDate(data.value.fechaB),
    };

    const response = await getReportPDF(info);
    dataReport.value = response;
    if(dataReport.value.length===0) msgNoData.value = true
    generateDataGraphif()
  } catch (error) {
    console.log(error);
  }
  load.value.report = false;
}

function fechaActual() {
  const fecha = new Date();
  const formatoFecha = `${fecha.getFullYear()}/${(fecha.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${fecha.getDate().toString().padStart(2, "0")}`;

  return formatoFecha;
}

function optionsDate(date) {
  return date <= new Date().toISOString().slice(0, 10).replace(/-/g, '/') && date >= data.value.fechaA;
}

// Watchers to clear dataReport when any field changes
watch(
  () => data.value.farm,
  () => {
    dataReport.value = [];
  }
);

watch(
  () => data.value.fechaA,
  () => {
    dataReport.value = [];
  }
);

watch(
  () => data.value.fechaB,
  () => {
    dataReport.value = [];
  }
);

function clearData() {
  data.value = { farm: "", fechaA: "", fechaB: "" };
  dataReport.value = [];
}

function optionsFn(date) {
  return date <= new Date().toISOString().slice(0, 10).replace(/-/g, '/')
}

let dataGraphic = {}
let categoriesGraphic = []
function generateDataGraphif() {
  dataGraphic = { temperature: [], humidity: [], radiation: [], masa: [], humfinal: [] }
  categoriesGraphic = []

  dataReport.value.forEach(month => {
    month.data.forEach(day => {
      console.log(day)
      dataGraphic.temperature.push(parseFloat(day.temperature).toFixed(2))
      dataGraphic.humidity.push(parseFloat(day.humidity).toFixed(2))
      dataGraphic.radiation.push(parseFloat(day.u).toFixed(2))
      dataGraphic.masa.push(parseFloat(day.masa).toFixed(2))
      dataGraphic.humfinal.push(parseFloat(day.humfinal).toFixed(2))

      categoriesGraphic.push(day.date)
    })
  })
}

const tab = ref("tabla")

let nameFile = ref('Reporte');
let generatingPdf = ref(false);

async function generatePdf() {
  generatingPdf.value = true;

  $q.loading.show({
    message: "Generando PDF...",
  });

  const current = document.getElementById("pdf").style.width;
  document.getElementById("pdf").style.width = "800px";

  await new Promise((resolve) => {
    const element = document.getElementById("graphics");

    if (element.children.length > 0) {
      resolve();
    } else {
      const observer = new MutationObserver(() => {
        if (element.children.length > 0) {
          observer.disconnect();
          resolve();
        }
      });
      observer.observe(element, { childList: true });
    }
  });

  const graphics = [
    "temperature",
    "humidity",
    "masa",
    "humfinal",
  ];

  const toolbars = document.getElementsByClassName("apexcharts-toolbar");
  const arrayToolbars = Array.from(toolbars);

  for (const toolbar of arrayToolbars) {
    toolbar.remove();
  }

  const table = document.getElementsByClassName("q-table")[0]
  console.log(table.style.border)
  const border = table.style.border;

  table.style.border = "2px solid black"

  const doc = new jsPDF({
    orientation: "landscape",
  unit: "mm",
  format: [600, 830],
  compress: true, //para que no pese tanto el pdf
  precision: 2, //para que no se vea borroso el texto
  userUnit: 1.0,
  });

  let yOffset = 120

  const report = document.getElementById("pdf")
  await doc.html(report, {
    x: 0, // Posición x en el PDF
    y: 0, // Posición y en el PDF
    margin: [15, 15, 15, 15],
    autoPaging: true, // Agregar nuevas páginas si el contenido HTML es largo
  });

  for (let i = 0; i < graphics.length; i++) {
    const graphic = graphics[i];

    await html2canvas(document.getElementById(graphic)).then(
      (canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = 350; // Ancho de la imagen en mm
        const pageHeight = doc.internal.pageSize.height;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const remainingHeight = yOffset + imgHeight;

        if(i==0) doc.addPage();
        // Si la imagen no cabe en la página actual, agrega una nueva
        if (remainingHeight > pageHeight) {
          doc.addPage();
          yOffset = 120; // Reinicia el offset en la nueva página
        }

        const isPar = (i+1)%2==0
        const xOffset = isPar ? 436 : 43

        doc.addImage(imgData, "PNG", xOffset, yOffset, imgWidth, imgHeight);

        // Ajusta el offset para la próxima imagen
        if(isPar) yOffset += imgHeight + 120; // Espaciado entre cada par de gráficos
      }
    );
  }

  doc.save(`${nameFile.value}-${new Date().toISOString().split("T")[0]}.pdf`);

  $q.loading.hide();
  generatingPdf.value = false;
  document.getElementById("pdf").style.width = current;
  table.style.border = border
}
</script>

<template>
  <div class="row">
    <div class="col-12">
      <HeaderLayout title="Reportes" />
      <q-form @submit.prevent.stop="getReports">
        <div id="contFilter" class="justify-evenly flex full-width">
          <div class="divInputFilter" style="max-width: 300px">
            <span>Fecha inicial: </span>
            <q-input class="subtitles" filled v-model="data.fechaA" mask="date" :rules="[
              'date',
              (val) =>
                val <= fechaActual() ||
                'La fecha no puede ser mayor a la fecha actual',
            ]">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="data.fechaA" :options="optionsFn">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Cerrar" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <div class="divInputFilter" style="max-width: 300px">
            <span>Fecha final: </span>
            <q-input class="subtitles" filled v-model="data.fechaB" mask="date" :rules="[
              'date',
              (val) =>
                val >= data.fechaA ||
                'La fecha no puede ser anterior a la fecha inicial',
            ]">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="data.fechaB" :options="optionsDate">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Cerrar" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <div class="divInputFilter" style="max-width: 300px">
            <span>Finca: </span>
            <q-select class="subtitles" outlined v-model="data.farm" use-input input-debounce="0"
              label="Seleccione una finca" behavior="menu" @filter="filterFnFarm" :options="farmsFilter"
              :rules="[(val) => !!val || 'Seleccione una opción']" :loading="load.farm" :disable="load.farm" fill-input
              hide-selected>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    Sin resultados
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </div>
        <div class="justify-around flex full-width q-my-sm">
          <q-btn v-if="dataReport.length <= 0" class="bg-green-7 text-white" label="Generar" type="submit"
            :loading="load.report"></q-btn>
          <q-btn v-if="dataReport.length > 0" class="bg-green-7 text-white" label="Limpiar"
            @click="clearData()"></q-btn>
        </div>
      </q-form>
    </div>
    <div v-if="dataReport.length > 0" class="col-12  flex" style="overflow: auto;">
      <div class="q-pa-md">
        <div class="q-gutter-y-md">
          <q-card style="min-width:95vw;">
            <q-tabs v-model="tab" dense active-color="primary" indicator-color="primary" align="justify"
              narrow-indicator>
              <q-tab name="tabla" label="Tabla de datos" />
              <q-tab name="temperature" label="Temperatura" />
              <q-tab name="humidity" label="Humedad" />
              <q-tab name="masa" label="Masa" />
              <q-tab name="humfinal" label="Humedad final" />

            </q-tabs>

            <q-separator />

            <q-tab-panels v-model="tab" animated>
              <q-tab-panel name="tabla">
                <div class="col-10 justify-end flex">
                  <q-btn icon="picture_as_pdf" color="red-10" size="14px" @click="generatePdf">
                    <q-tooltip class="bg-white text-green-9">Descargar PDF</q-tooltip>
                  </q-btn>
                </div>
                <div id="pdf">
                  <Report :dates="{
                    start: data.fechaA,
                    end: data.fechaB,
                    farm: data.farm.label
                  }" :data="dataReport" />

                </div>
                
                <div id="graphics">
                <div v-if="generatingPdf" >
                  <div class="col-12 col-md-6" style="width:400px">
                    <LineChartBasic v-if="dataReport.length > 0" :data="dataGraphic.temperature"
                      :categories="categoriesGraphic" name="temperature" title="Temperatura" symbolLabel="°C" />
                  </div>
  
  
                  <div class="col-12 col-md-6" style="width:400px">
                    <LineChartBasic v-if="dataReport.length > 0" :data="dataGraphic.humidity"
                      :categories="categoriesGraphic" name="humidity" title="Humedad" symbolLabel="%" />
                  </div>
  
                  <div class="col-12 col-md-6" style="width:400px">
                    <LineChartBasic v-if="dataReport.length > 0" :data="dataGraphic.masa"
                      :categories="categoriesGraphic" name="masa" title="Masa" symbolLabel="g" />
                  </div>
  
                  <div class="col-12 col-md-6" style="width:400px">
                    <LineChartBasic v-if="dataReport.length > 0" :data="dataGraphic.humfinal"
                      :categories="categoriesGraphic" name="humfinal" title="Humedad final" symbolLabel="%" />
                  </div>
                </div>
                </div>

              </q-tab-panel>

              <q-tab-panel name="temperature">
                <div class="col-12 col-md-6">
                  <LineChartBasic v-if="dataReport.length > 0" :data="dataGraphic.temperature"
                    :categories="categoriesGraphic" name="Nivel" title="Temperatura" symbolLabel="°C" />
                </div>
              </q-tab-panel>

              <q-tab-panel name="humidity">
                <div class="col-12 col-md-6">
                  <LineChartBasic v-if="dataReport.length > 0" :data="dataGraphic.humidity"
                    :categories="categoriesGraphic" name="Nivel" title="Humedad" symbolLabel="%" />
                </div>
              </q-tab-panel>

              <q-tab-panel name="masa">
                <div class="col-12 col-md-6">
                  <LineChartBasic v-if="dataReport.length > 0" :data="dataGraphic.masa" :categories="categoriesGraphic"
                    name="Peso" title="Masa" symbolLabel="g" />
                </div>
              </q-tab-panel>

              <q-tab-panel name="humfinal">
                <div class="col-12 col-md-6">
                  <LineChartBasic v-if="dataReport.length > 0" :data="dataGraphic.humfinal"
                    :categories="categoriesGraphic" name="Nivel" title="Humedad final" symbolLabel="%" />
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </q-card>
        </div>
      </div>
    </div>
    <div v-if="msgNoData" class="col-12 justify-center flex">
      <h1>No hay datos para mostrar</h1>
    </div>
  </div>
</template>

<style scoped>
h1 {
  text-align: center;
  font-size: xx-large;
  margin: 0;
}

form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.divInputFilter {
  margin: 0.5rem 1rem;
}

.subtitles {
  margin-top: 0.5rem;
}

#contFormat {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

#containerGraphics{
  justify-content: center;
    gap: 1rem;
}
</style>