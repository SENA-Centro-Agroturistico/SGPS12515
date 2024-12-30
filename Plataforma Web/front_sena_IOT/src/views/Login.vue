<script setup>
import { ref } from "vue";
import { useQuasar } from "quasar";
import { storeUsers } from "../stores/users.js";
import { useRouter } from "vue-router";
import { login } from "../api/auth.api.js";

const router = useRouter();
const useUsers = storeUsers();

const $q = useQuasar();
function notificar(tipo, msg) {
  $q.notify({
    type: tipo,
    message: msg,
    position: "top",
  });
}

let form = ref({
  email: "",
  password: "",
});

const loadBtn = ref(false);
async function onSubmit() {
  try {
    loadBtn.value = true;
    const response = await login(form.value)
    const dateNow = new Date().toISOString();
    localStorage.setItem("token", response.token)
    localStorage.setItem('dateLogin', dateNow);
    await useUsers.setUser()
    await useUsers.setFarms()
    useUsers.setFarm()

    router.push("/nav");
  } catch (error) {
    console.log(error);
  } finally {
    loadBtn.value = false;
  }
}

const seePassword = ref(false)
</script>

<template>
  <div id="login">
    <div class="login-card">
      <div class="logo-container">
        <img src="../assets/logo.ico" alt="Logo" class="logo" />
      </div>
      <div class="text-white text-center text-h5 q-mb-xl q-mt-lg">
        Sistema IOT - Secado del Café
      </div>
      <q-form @submit="onSubmit" class="q-gutter-md">
        <q-input color="white" label-color="dark" outlined type="email" v-model="form.email"
          label="Correo electrónico *" lazy-rules :rules="[
            (val) => (val && val.length > 0) || 'Correo electrónico requerido',
            (val) => /.+@.+\..+/.test(val) || 'Correo electrónico inválido',
          ]" bg-color="white" />

        <q-input color="white" label-color="dark" outlined :type="seePassword ? 'text' : 'password'"
          v-model="form.password" label="Contraseña *" lazy-rules :rules="[
            (val) => (val !== null && val !== '') || 'Contraseña requerida',
          ]" bg-color="white">
          <template v-slot:append>
            <q-icon :name="seePassword ? 'visibility' : 'visibility_off'" class="cursor-pointer"
              @click="seePassword = !seePassword" />
          </template>
        </q-input>

        <div id="contBtnLogin">
          <q-btn class="button_style" label="Iniciar Sesión" type="submit" :loading="loadBtn" />
        </div>
      </q-form>

      <div id="cont-forgot-password">
        <router-link to="/forgot-password">Recuperar contraseña</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
#login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-image: url("../assets/images/cultivo-cafe.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.9;
  position: relative;
}

#login::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  /* Ajusta la transparencia aquí */
  z-index: -1;
}

.login-card {
  padding: 20px;
  background: rgba(0, 0, 0, 0.905);
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 400px;
  margin: 2rem;
}

.logo-container {
  text-align: center;
}

.logo {
  max-width: 100px;
}

.input-group {
  margin-bottom: 15px;
}

.input-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.actions {
  text-align: center;
}

.login-btn {
  background-color: #007bff;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

#cont-forgot-password {
  margin-top: 20px;
  text-align: center;
  margin-left: 16px;
}

#cont-forgot-password>a {
  color: white;
}

#contBtnLogin {
  width: 100%;
  display: flex;
  justify-content: center;
}

input {
  color: "red";
}
</style>
