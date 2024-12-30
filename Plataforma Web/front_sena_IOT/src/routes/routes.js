import Login from "../views/Login.vue";
import Home from "../views/Home.vue";
import Nav from "../views/Nav.vue";
import { useRouter } from "vue-router";
import Cookies from "js-cookie";
import Termomanometro from "../views/Termomanometro.vue";
import Termometro from "../views/Termometro.vue";
import Weighing from "../views/Weighing.vue";
import Users from "../views/Users.vue";
import Farms from "../views/Farms.vue";
import ForgotPassword from "../views/ForgotPassword.vue";
import NewPassword from "../views/NewPassword.vue";
import GenerateReport from "../views/GenerateReport.vue"
import Sensors from "../views/Sensors.vue"
import { storeUsers } from "../stores/users.js";

const checkAuth = () => {
  const cookie = Cookies.get("access_token");
  if (!cookie) return false;
  return true;
};

const auth = (to, from, next) => {
  if (checkAuth()) {
    const userStore = storeUsers();
    const role = userStore.user?.role;
    if(to.meta.rol && !to.meta.rol.includes(role)) {
      return next({ name: "home" });
    }
    next();
  } else {
    next({ name: "login" });
  }
};

const returnHome = (to, from, next) => {
  if (checkAuth()) {
    next({ name: "home" });
  } else {
    next();
  }
};

let router = useRouter();
export const routes = [
  {
    path: "/",
    name: "login",
    component: Login,
    beforeEnter: returnHome,
  },
  {
    path: "/forgot-password",
    name: "forgot-password",
    component: ForgotPassword,
    beforeEnter: returnHome,
  },
  {
    path: "/new-password/:token",
    name: "new-password",
    component: NewPassword,
    beforeEnter: returnHome,
  },
  {
    path: "/:catchAll(.*)",
    redirect: "/",
  },
  {
    path: "/nav",
    name: "nav",
    component: Nav,
    children: [
      { path: "/nav", redirect: "/home" },
      {
        path: "/users",
        name: "users",
        component: Users,
        meta: {
          rol: ["ADMINISTRADOR"],
        },
        beforeEnter: auth,
      },
      {
        path: "/farms",
        name: "farms",
        component: Farms,
        meta: {
          rol: ["ADMINISTRADOR"],
        },
        beforeEnter: auth,
      },
      {
        path: "/sensors",
        name: "sensors",
        component: Sensors,
        meta: {
          rol: ["ADMINISTRADOR"],
        },
        beforeEnter: auth,
      },
      {
        path: "/home",
        name: "home",
        component: Home,
        beforeEnter: auth,
        meta: {
          rol: ["ADMINISTRADOR", "USUARIO"],
        },
        redirect: "/weighing",
      },
      {
        path: "/termometro",
        name: "termometro",
        component: Termometro,
        meta: {
          rol: ["ADMINISTRADOR", "USUARIO"],
        },
        beforeEnter: auth,
      },
      {
        path: "/termohigrometro",
        name: "termohigrometro",
        component: Termomanometro,
        meta: {
          rol: ["ADMINISTRADOR", "USUARIO"],
        },
        beforeEnter: auth,
      },
      {
        path: "/weighing",
        name: "weighing",
        component: Weighing,
        meta: {
          rol: ["ADMINISTRADOR", "USUARIO"],
        },
        beforeEnter: auth,
      },
      {
        path: "/report",
        name: "report",
        component: GenerateReport,
        meta: {
          rol: ["ADMINISTRADOR", "USUARIO"],
        },
        beforeEnter: auth,
      },
    ],
  },
];
