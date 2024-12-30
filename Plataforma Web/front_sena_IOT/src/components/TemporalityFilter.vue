<script setup>
import { ref, defineEmits, onBeforeMount, onUnmounted } from "vue";
import socket from "../plugins/socket";
import { useQuasar } from "quasar";
import { storeUsers } from "../stores/users.js";

const useUsers = storeUsers();

const $q = useQuasar();
const socketClient = socket.connected ? socket : socket.connect();
const isWaiting = ref(false); // Referencia para controlar el estado de espera

onBeforeMount(() => {
  // Escuchar eventos de actualización desde el socket
  socketClient.on("update", (data) => {
    if (!data.farm) return;

    if (useUsers.farm?._id != data.farm) return;
    if (!isWaiting.value) {
      isWaiting.value = true;
      updateReport();
      setTimeout(() => {
        isWaiting.value = false;
      }, 10000);
    }
  });
});

onUnmounted(() => {
  socket.disconnect();
});

function updateReport() {
  $q.notify({
    message: 'Se han recibido nuevos datos, deseas actualizarlos?',
    color: 'primary',
    avatar: '/images/logo-blanco.png',
    position: 'top',
    actions: [
      { label: 'Actualizar', color: 'white', handler: () => sendTemporality() }
    ],
  });
}

const options = [
  { label: "Último/s minuto/s", value: "m" },
  { label: "Última/s hora/s", value: "h" },
  { label: "Último/s día/s", value: "d" },
  { label: "Rango de fechas", value: "range" },
];
const valor = ref(6);
const type = ref({ label: "Última/s hora/s", value: "h" });

const info = ref();
const date = ref({ from: '', to: '' });

const emit = defineEmits(["temporality"]);

const sendTemporality = () => {
  if (type.value.value === "range") {
    emit("temporality", { type: type.value.value, valor: info.value });
  } else {
    emit("temporality", { valor: valor.value, type: type.value.value });
  }
};

function optionsFn(date) {
  return date <= new Date().toISOString().slice(0, 10).replace(/-/g, '/')
}

const changeDate = () => {
  if(typeof date.value === 'object') info.value = `${date.value.from} - ${date.value.to}`;
  else info.value = `${date.value} - ${date.value}`;
};

const ruleDate = (val) => {
  if (date.value) {
    return true;
  } else {
    return "El rango de fechas es requerido";
  }
};

</script>

<template>
  <div id="container" class="col-12">
    <span id="titleFilter">
      <q-icon name="tune" />
      Filtrar por:
    </span>
  </div>

  <q-form @submit.prevent.stop="sendTemporality()" ref="myForm" class="col-11 col-lg-5 row flex justify-center">
    <div class="col-12 col-sm-4 q-mt-sm" v-if="type.value !== 'range'">
      <q-input filled class="full-width q-px-md" type="text" v-model="valor" label="Valor" lazy-rules :rules="[
        (val) =>
          (val && val.toString().trim().length > 0) ||
          'El campo es requerido',
      ]">
        <template v-slot:prepend>
          <span class="material-symbols-outlined"> speed </span>
        </template>
      </q-input>
    </div>

    <div class="col-12 col-sm-4 q-mt-sm" v-if="type.value == 'range'">
      <q-input readonly filled v-model="info" :rules="[ruleDate]" label="Rango de fechas" lazy-rules class="full-width q-px-md" >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="date" range :options="optionsFn" @update:model-value="changeDate()">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Cerrar" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>

    <div class="col-12 col-sm-4 q-mt-sm" >
      <q-select filled class="full-width q-px-md" type="text" v-model="type" :options="options" label="Tipo"
        :option-label="(row) => row.label" :option-value="(row) => row.value" lazy-rules :rules="[
          (val) =>
            (val && val.toString().trim().length > 0) ||
            'El campo es requerido',
        ]">
        <template v-slot:prepend>
          <span class="material-symbols-outlined"> drag_indicator </span>
        </template>
      </q-select>
    </div>

    <div class="justify-center flex items-start col-12 col-sm-3 q-pb-md">
      <q-btn label="Filtrar" type="submit" class="q-mt-md q-mb-sm q-mx-sm" color="green-8">
      </q-btn>
    </div>
  </q-form>
</template>

<style scoped>
#titleFilter {
  font-size: large;
}

#temporalityDiv>div {
  width: 200px;
}

#container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

#container>div {
  margin: 1rem;
}

#divBtnFilter {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding-left: 1.5rem;
  flex-wrap: wrap;
}

.divFilter {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-left: 0.2rem;
}
</style>