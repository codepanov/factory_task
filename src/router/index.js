import Vue from "vue"
import VueRouter from "vue-router"
import Home from "../views/Home.vue"
import Statistics from "../views/Statistics.vue"

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/statistics",
    name: "Statistics",
    component: Statistics
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router
