import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    labels: [],
    dataset: []
  },
  getters: {
    labels: state => {
      return state.labels
    },
    dataset: state => {
      return state.dataset
    }
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  }
})
