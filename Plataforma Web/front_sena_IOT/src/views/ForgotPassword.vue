<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { forgotPassword } from "../api/forgotPassword.api.js";
import { useQuasar } from "quasar";

const loadBtn = ref(false);

const email = ref("");

const router = useRouter();
const $q = useQuasar();

async function onSubmit() {
  loadBtn.value = true;
  try {
    const response = await forgotPassword(email.value);
    console.log(response);

    $q.dialog({
      title: "Recuperación de contraseña enviada",
      message: response.msg,
      persistent: true,
    })
      .onOk(() => {
        router.push("/");
      })
  } catch (error) {
    console.log(error);
  } finally {
    loadBtn.value = false;
  }
}
</script>

<template>
  <div id="login">
    <div class="login-card">
      <div class="logo-container">
        <img src="../assets/logo.ico" alt="Logo" class="logo" />
      </div>

      <span id="msg"
        >Por favor, digite su correo para el proceso de recuperación de
        contraseña.</span
      >

      <q-form @submit="onSubmit" class="q-gutter-md">
        <q-input
          color="white"
          label-color="dark"
          outlined
          type="email"
          v-model="email"
          label="Correo electrónico *"
          lazy-rules
          :rules="[
            (val) => (val && val.length > 0) || 'Correo electrónico requerido',
            (val) => /.+@.+\..+/.test(val) || 'Correo electrónico inválido',
          ]"
          bg-color="white"
        />

        <div id="contBtnLogin">
          <q-btn
            label="Recuperar contraseña"
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
.q-gutter-md {
  margin-top: 1rem;
}

#msg {
  color: white;
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
  text-align: center;
}

#login::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
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
  margin-bottom: 1rem;
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
