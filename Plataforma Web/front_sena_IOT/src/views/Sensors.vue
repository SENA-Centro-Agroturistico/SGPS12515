<script setup>
import { onBeforeMount, ref } from "vue";
import HeaderLayout from "../layouts/headerViewsLayout.vue";
import {
  getSensorsApi,
  createSensorApi,
  updateSensorApi,
} from "../api/sensors.api";
import { getFarmsApi } from "../api/farms.api";
import { format } from "quasar";

let index = ref();
let prompt = ref(false);
let edit = ref(false);
let form = ref({
  name: "",
  type: "",
  farm: "",
  status: 0,
});

let loading = ref(false);

let columns = ref([
  {
    name: "name",
    label: "NOMBRE",
    field: "name",
    align: "center",
    sortable: true,
  },
  {
    name: "type",
    label: "TIPO",
    field: "type",
    align: "center",
    sortable: true,
  },
  {
    name: "farm",
    label: "FINCA",
    field: (val) => val.farm.name + " / " + val.farm.codeFarm,
    align: "center",
    sortable: true,
  },
  {
    name: "status",
    label: "ESTADO",
    field: (row) => (row.status == false ? "Inactivo" : "Activo"),
    align: "center",
    sortable: true,
  },
  { name: "options", label: "OPCIONES", align: "center" },
]);

let rows = ref([]);

const optionsSelect = ref({
  farms: [],
  typeSensor: [{ label: "TERMÓMETRO", value: "TERMOMETRO" }, { label: "TERMOHIGRÓMETRO", value: "TERMOHIGROMETRO" }, { label: "BÁSCULA", value: "BASCULA" }]
});

const loadFarm = ref(true)

onBeforeMount(async () => {
  await getSensors();
  await getFarms();
});

function showInfo(data) {
  index.value = data._id;
  form.value = { ...data, farm: { label: data.farm.name + " / " + data.farm.codeFarm, value: data.farm._id } };
  edit.value = true;
  prompt.value = true;
  loading.value = false;
}

async function activeInactive(idSensor) {
  index.value = idSensor;
  const data = rows.value.find((item) => item._id == idSensor);
  console.log(data);
  data.status = !data.status;
  console.log(data);
  form.value = { ...data, farm: { label: data.farm.name, value: data.farm._id } };
  await putSensor();
}

const getSensors = async () => {
  const data = await getSensorsApi();
  if (data?.data.length > 0) {
    console.log(data.data);
    rows.value = data.data?.map((sensor) => {
      return {
        ...sensor,
        type: optionsSelect.value.typeSensor.find((item) => item.value == sensor.type),
      };
    });
  }
};

const clearForm = () => {
  form.value = {
    name: "",
    type: "",
    farm: "",
    status: true,
  };
};

async function postSensor() {
  loading.value = true;

  await createSensorApi({
    ...form.value, 
    farm: form.value.farm.value,
    type: form.value.type.value

  }).then(async (res) => {
    console.log(res);
    if (res && res.status < 299) {
      prompt.value = false;
      edit.value = false;
      clearForm();
      await getSensors();
    }
  });
  loading.value = false;
}

async function putSensor() {
  loading.value = true;

  console.log(form.value);
  await updateSensorApi({
    ...form.value, id: index.value, 
    farm: form.value.farm.value,
    type: form.value.type.value
  }).then(
    async (res) => {
      if (res && res.status < 299) {
        clearForm();
        prompt.value = false;
        edit.value = false;
        await getSensors();
      }
    }
  );
  loading.value = false;
}

const getFarms = async () => {
  loadFarm.value = true;

  const data = await getFarmsApi();
  if (data?.data.length > 0) {
    console.log(data.data);
    const farms = data.data.filter(farm => farm.status === true);

    optionsSelect.value.farms = farms.map((farm) => {
      return {
        label:
          farm.name + " / " + farm.codeFarm,
        value: farm._id,
        disable: farm.status === 0,
      };
    });
  }

  loadFarm.value = false;
};

const optionsFilter = ref({
  farms: optionsSelect.farms,
});

function filterFn(val, update) {
  val = val.trim();
  if (val === "") {
    update(() => {
      optionsFilter.value.farms = optionsSelect.value.farms;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    optionsFilter.value.farms =
      optionsSelect.value.farms.filter(
        (v) => v.label.toLowerCase().indexOf(needle) > -1
      ) || [];
  });
}
</script>

<template>
  <div class="q-my-xl">
    <HeaderLayout title="Sensores" />
    <div class="row q-mt-lg">
      <div class="col-1"></div>
      <div class="col-10">
        <q-btn class="bg-green-9 text-white" @click="clearForm(), (prompt = true), (edit = false)"><span
            class="material-symbols-outlined q-mr-sm" style="font-size: 20px">
            add_circle
          </span>
          Crear
        </q-btn>
      </div>
      <div class="col-1"></div>
    </div>
    <!-- TABLE INFO -->
    <div class="row q-mt-md justify-center">
      <div class="col-11 q-mb-lg">
        <q-table flat bordered no-data-label="Sin registros aún" :rows="rows" :columns="columns" row-key="index"
          class="q-mx-md my-sticky-header-table" rows-per-page-label="Numero de documentos"
          :rows-per-page-options="[10, 20, 30, 40, 50, 0]" :pagination="{
            rowsPerPage: 50,
          }">

          <template v-slot:body-cell-type="props">
            <q-td :props="props">
              <div>
                {{ props.value.label }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <div>
                <q-badge v-if="props.value === 'Activo'" class="bg-green-10">{{
                  props.value
                }}</q-badge>
                <q-badge v-else class="bg-red">{{ props.value }}</q-badge>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-options="props">
            <q-td :props="props">
              <div>
                <q-btn round icon="edit" class="q-mx-md" size="xs" color="green-10"
                  @click="showInfo(props.row)"></q-btn>
                <q-btn v-if="props.row.status" round size="xs" color="green-10"
                  @click="activeInactive(props.row._id)"><span class="material-symbols-outlined"
                    style="font-size: 18px">
                    check
                  </span></q-btn>
                <q-btn v-else round size="xs" color="red" @click="activeInactive(props.row._id)"><span
                    class="material-symbols-outlined" style="font-size: 18px">
                    close
                  </span></q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>

    <q-dialog v-model="prompt">
      <q-card>
        <q-card-section class="bg-green-9 q-px-lg">
          <h5 class="q-mt-sm q-mb-sm text-white text-center text-weight-bold">
            {{ edit ? "MODIFICA LA INFORMACIÓN" : "DILIGENCIA LA INFORMACIÓN" }}
          </h5>
        </q-card-section>
        <div class="q-pa-md">
          <q-form @submit.prevent.stop="edit ? putSensor() : postSensor()" novalidate>
            <div>
              <q-input filled type="text" v-model="form.name" label="Nombre del sensor" lazy-rules :rules="[
                (val) =>
                  (val && val.trim().length > 0) || 'El campo es requerido',
              ]">
                <template v-slot:prepend>
                  <span class="material-symbols-outlined"> person </span>
                </template>
              </q-input>

              <q-select filled v-model:model-value="form.type" input-debounce="0" label="Tipo"
                :options="optionsSelect.typeSensor" behavior="menu"
                :rules="[(val) => !!val || 'Seleccione una opción']">
                <template v-slot:prepend>
                  <span class="material-symbols-outlined"> category </span>
                </template>
              </q-select>

              <q-select class="input3" filled v-model="form.farm" use-input input-debounce="0" fill-input hide-selected
                label="Finca" behavior="menu" @filter="filterFn" :options="optionsFilter.farms"
                :rules="[(val) => val != null || 'Seleccione una finca']" :loading="loadFarm" :disable="loadFarm">
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      Sin resultados
                    </q-item-section>
                  </q-item>
                </template>

                <template v-slot:prepend>
                  <span class="material-symbols-outlined"> house </span>
                </template>
              </q-select>

              <div class="justify-center flex">
                <q-btn icon="save_as" label="GUARDAR" type="submit" class="q-mt-md q-mb-sm q-mx-sm save_as"
                  :loading="loading">
                  <template v-slot:loading>
                    <q-spinner-oval color="white" size="1em" />
                  </template>
                </q-btn>

                <q-btn type="button" class="q-mt-md q-mb-sm q-mx-sm" to="" v-close-popup><span
                    class="material-symbols-outlined q-mr-sm" style="font-size: 23px">
                    cancel </span>CERRAR</q-btn>
              </div>
            </div>
          </q-form>
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped>
.save_as {
  background-color: var(--color_button);
  color: var(--color_text_button);
}
</style>
