<template>
  <div id="app">
    <NavBar class="navbar" />
    <div class="content-wrapper">
      <RouterView class="router-view" :class="{ 'sidebar-open': isSidebarOpen }" />
      <Galerie class="galerie-sidebar" :class="{ 'open': isSidebarOpen }" />
      <button @click="toggleSidebar" class="sidebar-toggle btn btn-light" :class="{ 'open': isSidebarOpen }">
        <i class="bi" :class="isSidebarOpen ? 'bi-chevron-right' : 'bi-chevron-left'"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import NavBar from './components/NavBar.vue';
import Galerie from '@/components/Galerie.vue';

export default {
  name: 'App',
  components: {
    NavBar,
    Galerie
  },
  setup() {
    const isSidebarOpen = ref(true);

    const toggleSidebar = () => {
      isSidebarOpen.value = !isSidebarOpen.value;
    };

    return {
      isSidebarOpen,
      toggleSidebar
    };
  }
}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
}

.content-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.router-view {
  flex: 1;
  overflow-y: auto;
  transition: padding-right 0.3s ease;
}

.router-view.sidebar-open {
  padding-right: 250px;
}

.galerie-sidebar {
  position: fixed;
  top: 0;
  right: -250px;
  width: 250px;
  height: 100vh;
  overflow-y: auto;
  background-color: #f8f9fa;
  margin-top: 60px;
  transition: right 0.3s ease;
}

.galerie-sidebar.open {
  right: 0;
}

.sidebar-toggle {
  position: fixed;
  top: 10vh; /* Positioniert den Button im oberen Viertel der Seite */
  right: 0;
  z-index: 1001;
  border: none;
  border-radius: 4px 0 0 4px;
  padding: 10px 5px;
  cursor: pointer;
  transition: right 0.3s ease, background-color 0.3s ease;
  box-shadow: -2px 0 5px rgba(0,0,0,0.1);
}

.sidebar-toggle:hover {
  background-color: #e9ecef;
}

.sidebar-toggle.open {
  right: 250px;
}

.sidebar-toggle .bi {
  font-size: 1.0rem;
}
</style>