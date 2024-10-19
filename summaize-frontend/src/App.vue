<template>
  <div id="app">
    <NavBar />
    <RouterView class="router-view" />
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue'

export default {
  name: 'App',
  components: {
    NavBar
  }
}
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.router-view {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>