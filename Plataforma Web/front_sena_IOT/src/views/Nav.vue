<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router';
import Cookies from "js-cookie"
import { storeUsers } from "../stores/users.js";

const useUsers = storeUsers();
const router = useRouter();
let currentRoute = ref(router.currentRoute.value.path)

const leftDrawerOpen = ref(false)
let farm = ref(null)
let optionsFarm = ref([])

onMounted(() => {
  leftDrawerOpen.value = false
  farm.value = {
    label: `${useUsers.farm.codeFarm} - ${useUsers.farm.name}`,
    value: useUsers.farm._id,
  }
  optionsFarm.value = useUsers.farms.map((farm) => {
    return {
      label: `${farm.codeFarm} - ${farm.name}`,
      value: farm._id,
    }
  })
})

watch(() => router.currentRoute.value.path, (value) => {
  currentRoute.value = value
})

function onChangeSelectFarm (farm){
  useUsers.setFarm(farm.value)
}


const menuList = [
  {
    icon: 'supervisor_account',
    label: 'Usuarios',
    separator: false,
    route: '/users',
    auth: ['ADMINISTRADOR'],
  },
  {
    icon: 'supervisor_account',
    label: 'Fincas',
    separator: false,
    route: '/farms',
    auth: ['ADMINISTRADOR'],
  },
  {
    icon: 'sensors',
    label: 'Sensores',
    separator: false,
    route: '/sensors',
    auth: ['ADMINISTRADOR'],
  },
  // {
  //   icon: 'home',
  //   label: 'Termometro',
  //   separator: false,
  //   route: '/termometro',
  //   auth: ['ADMINISTRADOR', 'USUARIO'],
  // },
  {
    icon: 'thermostat',
    label: 'Termohigrómetro',
    separator: false,
    route: '/termohigrometro',
    auth: ['ADMINISTRADOR', 'USUARIO'],
  },
  {
    icon: 'water_drop',
    label: 'Báscula',
    separator: false,
    route: '/weighing',
    auth: ['ADMINISTRADOR', 'USUARIO'],
  },
  {
    icon: 'description',
    label: 'Reportes',
    separator: false,
    route: '/report',
    auth: ['ADMINISTRADOR', 'USUARIO'],
  },
]

const itemActive = ref('Home');

function logout() {
  Cookies.remove('access_token');
  router.push('/')
}
</script>
<template>
  <q-layout view="hHh lpR fFf">

    <q-header elevated class="header text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />

        <span class="text-h5">SENA IOT</span>
        <q-toolbar-title class="justify-center flex">
          <img class="q-pr-xl q-mr-xl" src="/images/logo-blanco.png" style="height: 38px" />   
        </q-toolbar-title>

        <q-btn dense flat round icon="logout" @click="logout" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above :width="250" :breakpoint="500" bordered overlay
      :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'">
      <q-scroll-area style="
        height: calc(100% - 220px);
        margin-top: 220px;
        border-right: 1px solid #ddd;
      ">
        <q-list style="padding-top: 20px">

          <template v-for="(menuItem, index) in menuList" :key="index">
            <q-item 
            v-if="useUsers.user && menuItem.auth?.includes(useUsers.user?.role)"
            :class="menuItem.route === currentRoute ? 'bg-green-6 text-white' : 'bg-green-9'"
            class="text-white q-mb-md q-mx-lg" style="border-radius: 12px; width: 200px" clickable
              :active="menuItem.route === currentRoute" v-ripple :to="menuItem.route"
              @click="itemActive = menuItem.label">
              <q-item-section avatar class="style-text" style="min-width: 1px">
                <q-icon class="" :name="menuItem.icon" />
              </q-item-section>
              <q-item-section class="style-text ">
                {{ menuItem.label }}
              </q-item-section>
            </q-item>
          </template>

        </q-list>
      </q-scroll-area>
      <q-img class="absolute-top bg-grey-2 text-center" style="height: 220px">
        <div class="absolute-bottom bg-transparent text-black">
          <q-avatar size="80px" class="q-pt-sm">
            <img src="/images/LOGO-SENA.png" />
          </q-avatar>
          <div class="text-weight-bolder text-h6 text-uppercase">
            {{ useUsers.user?.role || '' }}
          </div>
          <div style="font-size: 10px;">
            {{ useUsers.user?.email || '' }}
          </div>
          <div style="font-size: 12px;">
            <q-select
            class="q-mt-sm"
                dense
                outlined
                type="text"
                v-model="farm"
                :options="optionsFarm"
                label="Finca"
                :option-label="(row) => row.label"
                :option-value="(row) => row.value"
                lazy-rules
                :rules="[
                  (val) =>
                    (val && val.toString().trim().length > 0) ||
                    'El campo es requerido',
                ]"
                @update:model-value="onChangeSelectFarm"
              >
              </q-select>
          </div>
        </div>
      </q-img>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<style scoped>
.header {
  background-color: var(--color_header);
}
</style>