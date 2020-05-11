<template>
  <div class="home">
    <Fields header="My awesome task" />
  </div>
</template>

<script>
import Fields from "@/components/Fields.vue";
import { bus } from '../main'

export default {
  name: "Home",
  components: {
    Fields
  },

  // making sure that Interval stops before we leave HOME route
  beforeRouteLeave (to, from , next) {
    bus.$once('intervalId', (data) => {
      clearInterval(data.intId)
    })
    next()
  }
};
</script>

<style>
  #nav {
    padding: 20px 20px 0px
  }
</style>