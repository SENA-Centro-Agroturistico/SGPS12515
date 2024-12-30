<template>
  <div class="q-my-xl">
    <HeaderLayout title="Usuarios"/>
    <div class="row">
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
            @submit.prevent.stop="edit ? putUser() : postUsers()"
            novalidate
          >
            <div>
              <q-input
                filled
                type="text"
                v-model="form.username"
                label="Nombre"
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
                type="number"
                v-model="form.phone"
                label="Teléfono"
                lazy-rules
                :rules="[
                  (val) =>
                    (val && val.trim().length > 0) || 'El campo es requerido',
                ]"
              >
                <template v-slot:prepend>
                  <span class="material-symbols-outlined"> phone </span>
                </template>
              </q-input>


              <q-input
                filled
                type="email"
                v-model="form.email"
                label="Correo electrónico"
                lazy-rules
                :rules="[
                  (val) =>
                    (val && val.trim().length > 0) || 'El campo es requerido',
                ]"
              >
                <template v-slot:prepend>
                  <span class="material-symbols-outlined"> mail </span>
                </template>
              </q-input>

              <q-select
                filled
                type="text"
                v-model="form.role"
                :options="optionsRole"
                label="Rol"
                :option-label="(row) => row.label"
                :option-value="(row) => row.value"
                lazy-rules
                :rules="[
                  (val) =>
                    (val && val.toString().trim().length > 0) ||
                    'El campo es requerido',
                ]"
              >
                <template v-slot:prepend>
                  <span class="material-symbols-outlined">
                    drag_indicator
                  </span>
                </template>
              </q-select>


              <q-select
              v-if="form.role.value == 'USER'"
                filled
                v-model="form.farms"
                multiple
                :options="optionsFarm"
                options-dense
                use-chips
                use-input
                label="Fincas"
                input-debounce="0"
                lazy-rules
                :rules="[
                  (val) =>
                    (val && val.toString().trim().length > 0) ||
                    'El campo es requerido',
                ]"
              >
                <template v-slot:prepend>
                  <span class="material-symbols-outlined"> location_city </span>
                </template>
              </q-select>

              
              <q-input
                filled
                v-model="form.password"
                label="Contraseña"
                :type="isPwd ? 'password' : 'text'"
                lazy-rules
                :rules="[
                  (val) =>
                    (val && val.trim().length > 5) || 'Mínimo 5 caracteres',
                ]"
              >
                <template v-slot:append>
                  <q-icon
                    :name="isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwd = !isPwd"
                  />
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
import { createUserApi, getUsersApi, updateUserApi } from "../api/users.api";
import { getFarmsApi } from "../api/farms.api";

const $q = useQuasar();

let index = ref();
let prompt = ref(false);
let edit = ref(false);
let form = ref({
  username: "",
  role: "",
  email: "",
  phone: "",
  password: "",
  farms: null,
  status: true,
});
let optionsFarm = ref([]);
let isPwd = ref(true);
let loading = ref(false);


let optionsRole = ref([{
  label: "ADMINISTRADOR",
  value: "ADMIN",
},
{
  label: "USUARIO",
  value: "USER",
}]);

let columns = ref([
  {
    name: "nombre",
    label: "NOMBRE",
    field: "username",
    align: "center",
    sortable: true,
  },
  {
    name: "correo",
    label: "CORREO",
    field: "email",
    align: "center",
    sortable: true,
  },
  {
    name: "phone",
    label: "TELÉFONO",
    field: "phone",
    align: "center",
    sortable: true,
  },
  {
    name: "rol",
    label: "ROL",
    field: "role",
    align: "center",
    sortable: true,
  },
  {
    name: "farms",
    label: "FINCAS",
    field: (row) => row.farms?.map((farm) => farm.name).join(", "),
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
  await getUsers();
  await getFarms();
});

function showInfo(data) {
  index.value = data._id;
  form.value.username = data.username;
  const role  = optionsRole.value.find((role) => role.value == data.role);
  form.value.role = {
    label: role.label,
    value: role.value,
  }
  form.value.email = data.email;
  form.value.phone = data.phone;
  form.value.password = data.password;
  form.value.farms = data.farms.map((farm) => {
    return {
      label: `${farm.codeFarm} - ${farm.name}`,
      value: farm._id,
    };
  });
  edit.value = true;
  prompt.value = true;
  loading.value = false;
}

async function activeInactive(idUser) {
  index.value = idUser;
  const data = rows.value.find((row) => row._id == idUser);
  data.status = !data.status;
  console.log(data.farms.map((farm) => farm._id));
   data.farms = data.farms.map((farm) => {
    return {
      label: `${farm.codeFarm} - ${farm.name}`,
      value: farm._id,
    };
  });
  form.value = data;
  await putUser();
}

const getUsers = async () => {
  const data =  await getUsersApi()
  if(data?.data.length > 0){
    rows.value = data.data;
  }
};
const getFarms = async () => {
  const data =  await getFarmsApi();
  if(data?.data.length > 0){;
    optionsFarm.value = data.data.map((farm) => {
      return {
        label:`${farm.codeFarm} - ${farm.name}`,
        value: farm._id,
      };
    });
  }
};



const clearForm = () => {
  form.value = {
    username: "",
    role: "",
    email: "",
    phone: "",
    password: "",
    farms: null,
    status:true
  };
};

async function postUsers() {
  loading.value = true;
  await createUserApi({
    ...form.value, 
    role: form.value.role.value,
    farms: form.value.farms?.map((farm) => farm.value),
  })
    .then(async (res) => {
      if (res && res.status < 299) {
        prompt.value = false;
        edit.value = false;
        clearForm();
        await getUsers();
      }
    });
  loading.value = false;
}

async function putUser() {
  loading.value = true;
  console.log(form.value);
  await updateUserApi({ 
    ...form.value, 
    id: index.value,
    role: form.value.role.value,
    farms: form.value.farms?.map((farm) => farm.value),
  })
    .then(async (res) => {
      if (res && res.status < 299) {
        clearForm();
        prompt.value = false;
        edit.value = false;
        await getUsers();
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
