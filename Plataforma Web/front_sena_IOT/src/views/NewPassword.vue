<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { putNewPassword } from "../api/forgotPassword.api.js";
import { useQuasar } from "quasar";

const router = useRouter();
const route = useRoute();
const $q = useQuasar();

const form = ref({
  email: localStorage.getItem("email"),
  password: "",
});

const confirmPassword = ref("");

const loadBtn = ref(false);
async function onSubmit() {
  try {
    const token = route.params.token
    loadBtn.value = true;
    const response = await putNewPassword(form.value, token);
    console.log(response);

    $q.dialog({
      title: "¡¡Contraseña actualizada con éxito!!",
      message: "Por favor inicie sesión",
      persistent: true,
    }).onOk(() => {
      localStorage.removeItem("token_temp");
      router.push("/");
    });
  } catch (error) {
    console.log(error);
  } finally {
    loadBtn.value = false;
  }
}

const seePassword = ref(false);
</script>

<template>
  <div id="login">
    <div class="login-card">
      <div class="logo-container">
        <img src="../assets/logo.ico" alt="Logo" class="logo" />
      </div>
      <q-form @submit="onSubmit" class="q-gutter-md">
        <q-input
          color="white"
          label-color="dark"
          outlined
          :type="seePassword ? 'text' : 'password'"
          v-model="form.password"
          label="Contraseña *"
          lazy-rules
          :rules="[
            (val) => (val !== null && val !== '') || 'Contraseña requerida',
            (val) =>
              val.length > 5 ||
              'La contraseña debe tener al menos 6 caracteres',
            (val) =>
              val.length < 20 ||
              'La contraseña no debe tener más de 20 caracteres',
            (val) =>
              /[a-z]/.test(val) ||
              'La contraseña debe tener al menos una letra minúscula',
            (val) =>
              /[A-Z]/.test(val) ||
              'La contraseña debe tener al menos una letra mayúscula',
            (val) =>
              /\d/.test(val) || 'La contraseña debe tener al menos un número',
            (val) =>
              /\W/.test(val) ||
              'La contraseña debe tener al menos un caracter especial',
          ]"
          bg-color="white"
        >
        </q-input>

        <q-input
          color="white"
          label-color="dark"
          outlined
          :type="seePassword ? 'text' : 'password'"
          v-model="confirmPassword"
          label="Confimar contraseña *"
          lazy-rules
          :rules="[
            (val) => (val !== null && val !== '') || 'Confirme su contraseña',
            (val) => val === form.password || 'Las contraseñas no coinciden',
          ]"
          bg-color="white"
        >
        </q-input>

        <q-checkbox
          size="xs"
          dark
          v-model="seePassword"
          label="Mostrar contraseña"
          id="checkbox"
        />

        <div id="contBtnLogin">
          <q-btn
            label="Cambiar contraseña"
            type="submit"
            color="primary"
            :loading="loadBtn"
          />
        </div>
      </q-form>
    </div>
  </div>
</template>

<style scoped>
#checkbox {
  color: white;
  margin-bottom: 1rem;
}

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
  margin-bottom: 50px;
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

#cont-forgot-password > a {
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
