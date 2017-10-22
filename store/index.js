import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = () => new Vuex.Store({

  state: {
    hash: '',
    query: {},
    items: [],
    settings: {}
  },

  mutations: {
    setQuery (query) {
      this.state.query = query
    }
  }
})

export default store
