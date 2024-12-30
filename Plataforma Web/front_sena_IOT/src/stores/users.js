import { defineStore } from "pinia";
import { jwtDecode } from "jwt-decode"
import Cookies from "js-cookie";
import { ref } from "vue";
import { getUserApi } from "../api/users.api";

export const storeUsers = defineStore(
  "storeUsers",
  () => {
    // State
    let farms = ref("");
    let farm = ref("");
    let user = ref({});

    const setUser = () => {
      const cookie = Cookies.get("access_token");
      if (cookie) {
        const decoded = jwtDecode(cookie);
        user.value = {
          id: decoded?.id || null,
          username: decoded.username,
          email: decoded.email,
          role: decoded.role == "ADMIN" ? "ADMINISTRADOR" : "USUARIO",
        }
      }
    }

    // setFars
    const setFarms = async () => {
      try {
        
        const response = await getUserApi(user.value.id);
        console.log("response", response.data);
        farms.value = response.data.farms;

        console.log("farms", farms.value);

      } catch (error) {
        console.error(error);
        const message = error.response.data.message || 'Error al obtener las fincas'
        notifyErrorRequest(message);
      }
      
    };


    // setFarm selected
    const setFarm = (farmId = null) => {
      if (!farmId) {
        farm.value = farms.value[0];
        return;
      }
      farm.value = farms.value.find((farm) => farm._id === farmId);
    };

    return {
      farms,
      farm,
      user,
      setFarms,
      setFarm,
      setUser,
    };
  },
  {
    persist: true,
  }
);
