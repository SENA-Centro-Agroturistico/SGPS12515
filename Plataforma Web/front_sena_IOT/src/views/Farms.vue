<template>
  <div class="q-my-xl">
    <HeaderLayout title="Fincas"/>
    <div class="row q-mt-lg">
      <div class="col-1"></div>
      <div class="col-10">
        <q-btn
          class="bg-green-9 text-white"
          @click="clearForm(), (prompt = true), (edit = false)"
          ><span
            class="material-symbols-outlined q-mr-sm"
            style="font-size: 20px"
          >
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
        <q-table
          flat
          bordered
          no-data-label="Sin registros aún"
          :rows="rows"
          :columns="columns"
          row-key="index"
          class="q-mx-md my-sticky-header-table"
          rows-per-page-label="Numero de documentos"
          :rows-per-page-options="[10, 20, 30, 40, 50, 0]"
          :pagination="{
            rowsPerPage: 50,
          }"
        >
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
                <q-btn
                  round
                  icon="edit"
                  class="q-mx-md"
                  size="xs"
                  color="green-10"
                  @click="showInfo(props.row)"
                ></q-btn>
                <q-btn
                  v-if="props.row.status"
                  round
                  size="xs"
                  color="green-10"
                  @click="activeInactive(props.row._id)"
                  ><span
                    class="material-symbols-outlined"
                    style="font-size: 18px"
                  >
                    check
                  </span></q-btn
                >
                <q-btn
                  v-else
                  round
                  size="xs"
                  color="red"
                  @click="activeInactive(props.row._id)"
                  ><span
                    class="material-symbols-outlined"
                    style="font-size: 18px"
                  >
                    close
                  </span></q-btn
                >
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
          <q-form
            @submit.prevent.stop="edit ? putFarm() : postFarm()"
            novalidate
          >
            <div>
              <q-input
                filled
                type="text"
                v-model="form.name"
                label="Nombre de la finca"
                lazy-rules
                :rules="[
                  (val) =>
                    (val && val.trim().length > 0) || 'El campo es requerido',
                ]"
              >
                <template v-slot:prepend>
                  <span class="material-symbols-outlined"> person </span>
                </template>
              </q-input>

              <q-input
                filled
                type="text"
                v-model="form.owner"
                label="Nombre del propietario"
                lazy-rules
                :rules="[
                  (val) =>
                    (val && val.trim().length > 0) || 'El campo es requerido',
                ]"
              >
                <template v-slot:prepend>
                  <span class="material-symbols-outlined"> person </span>
                </template>
              </q-input>

              <q-input
                filled
                type="text"
                v-model="form.codeFarm"
                label="Código de la finca"
                lazy-rules
                :rules="[
                  (val) =>
                    (val && val.trim().length > 0) || 'El campo es requerido',
                ]"
              >
                <template v-slot:prepend>
                  <span class="material-symbols-outlined"> code </span>
                </template>
              </q-input>

              <q-input
                filled
                type="text"
                v-model="form.department"
                label="Departamento"
                lazy-rules
                :rules="[
                  (val) =>
                    (val && val.trim().length > 0) || 'El campo es requerido',
                ]"
              >
                <template v-slot:prepend>
                  <span class="material-symbols-outlined"> location_city </span>
                </template>
              </q-input>

              <q-input
                filled
                type="email"
                v-model="form.city"
                label="Ciudad"
                lazy-rules
                :rules="[
                  (val) =>
                    (val && val.trim().length > 0) || 'El campo es requerido',
                ]"
              >
                <template v-slot:prepend>
                  <span class="material-symbols-outlined"> location_city </span>
                </template>
              </q-input>

              <q-input
                filled
                type="text"
                v-model="form.address"
                label="Dirección"
                lazy-rules
                :rules="[
                  (val) =>
                    (val && val.trim().length > 0) || 'El campo es requerido',
                ]"
              >
                <template v-slot:prepend>
                  <span class="material-symbols-outlined"> home </span>
                </template>
              </q-input>


              <div class="justify-center flex">
                <q-btn
                  icon="save_as"
                  label="GUARDAR"
                  type="submit"
                  class="q-mt-md q-mb-sm q-mx-sm save_as"
                  :loading="loading"
                >
                  <template v-slot:loading>
                    <q-spinner-oval color="white" size="1em" />
                  </template>
                </q-btn>

                <q-btn
                  type="button"
                  class="q-mt-md q-mb-sm q-mx-sm"
                  to=""
                  v-close-popup
                  ><span
                    class="material-symbols-outlined q-mr-sm"
                    style="font-size: 23px"
                  >
                    cancel </span
                  >CERRAR</q-btn
                >
              </div>
            </div>
          </q-form>
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { onBeforeMount, ref } from "vue";
import { useQuasar } from "quasar";
import HeaderLayout from "../layouts/headerViewsLayout.vue";
import { createFarmApi, getFarmsApi, updateFarmApi } from "../api/farms.api";

const $q = useQuasar();

let index = ref();
let prompt = ref(false);
let edit = ref(false);
let form = ref({
  name: "",
  owner: "",
  city: "",
  department: "",
  address: "",
  codeFarm: "",
  status: 0,
});
let loading = ref(false);

let columns = ref([
  {
    name: "owner",
    label: "PROPIETARIO",
    field: "owner",
    align: "center",
    sortable: true,
  },
  {
    name: "name",
    label: "FINCA",
    field: "name",
    align: "center",
    sortable: true,
  },
  {
    name: "city",
    label: "CIUDAD",
    field: "city",
    align: "center",
    sortable: true,
  },
  {
    name: "department",
    label: "DEPARTAMENTO",
    field: "department",
    align: "center",
    sortable: true,
  },
  {
    name: "address",
    label: "DIRECCIÓN",
    field: "address",
    align: "center",
    sortable: true,
  },
  {
    name: "codeFarm",
    label: "código",
    field: "codeFarm",
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

onBeforeMount(async () => {
  await getFarms();
});

function showInfo(data) {
  index.value = data._id;
  form.value = data
  edit.value = true;
  prompt.value = true;
  loading.value = false;
}

async function activeInactive(idFarm) {
  index.value = idFarm;
  const data = rows.value.find((item) => item._id == idFarm);
  console.log(data);
  data.status = !data.status
  console.log(data);
  form.value = data;
  await putFarm();
  
}

const getFarms = async () => {
  const data =  await getFarmsApi();
  if(data?.data.length > 0){
    console.log(data.data);
    rows.value = data.data;
  }
};


const clearForm = () => {
  form.value = {
    name: "",
    owner: "",
    city: "",
    department: "",
    address: "",
    codeFarm: "",
    status: true,
  };
};

async function postFarm() {
  loading.value = true;
  await createFarmApi(form.value)
    .then(async (res) => {
      console.log(res);
      if (res && res.status < 299) {
        prompt.value = false;
        edit.value = false;
        clearForm();
        await getFarms();
      }
    });
  loading.value = false;
}

async function putFarm() {
  loading.value = true;
  console.log(form.value);
  await updateFarmApi({...form.value, id: index.value})
    .then(async (res) => {
      if (res && res.status < 299) {
        clearForm();
        prompt.value = false;
        edit.value = false;
        await getFarms();
      }
    });
  loading.value = false;
}
</script>

<style scoped>
.save_as {
  background-color: var(--color_button);
  color: var(--color_text_button);
}
</style>
