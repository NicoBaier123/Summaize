<template>
  <nav
    class="navbar navbar-expand bg-dark border-bottom border-body"
    data-bs-theme="dark"
  >
    <div
      class="container-fluid d-flex align-items-center justify-content-between"
    >
      <!-- Linke Seite mit den Links -->
      <div class="d-flex align-items-center">
        <router-link class="navbar-brand nav-item" to="/">SummAize</router-link>
        <router-link class="nav-link nav-item" to="/about">About</router-link>
        <router-link class="nav-link nav-item" to="/admin">Admin</router-link>
      </div>
      <!-- Icon auf der rechten Seite -->
      <i
        class="bi bi-person-circle text-white"
        v-b-tooltip.hover
        title="Hello World"
      ></i>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'NavBar',
}
</script>

<style scoped>
/* Stil für den Navigations-Container, um Abstände und Ausrichtungen zu steuern */
.container-fluid {
  display: flex;
  align-items: center; /* Stellt sicher, dass die Links vertikal zentriert sind */
  justify-content: space-between; /* Nutzt den verfügbaren Platz optimal */
  margin-right: 10px;
  margin-left: 10px;
  padding-left: 10px; /* Geringfügiges Padding links */
  padding-right: 10px; /* Gleiches Padding rechts für Symmetrie */
}
.navbar-brand,
.nav-link {
  margin-right: 10px; /* Erhöhter Abstand zwischen den Links */
  padding: 0; /* Entfernt das Padding, um den Abstand zu minimieren */
  font-size: 1.25rem; /* Gleiche Textgröße für beide Links */
  color: white; /* Gleiche Textfarbe für beide Links */
}
.nav-item {
  margin-right: 40px; /* Setzen eines größeren Abstands zwischen den Links */
}

.nav-item:last-child {
  margin-right: 0; /* Entfernt den Abstand nach dem letzten Link */
}

.bi-person-circle {
  font-size: 32px; /* Vergrößert das Icon */
}
/* Tooltip-Styling */
.tooltip-inner {
  background-color: #555; /* Dunkelgrauer Hintergrund */
  color: #fff; /* Weiße Schriftfarbe */
  font-size: 1rem; /* Größere Schrift */
  border: 1px solid #333; /* Dunkler Rahmen */
}

/* Optional: Anpassung der Pfeilfarbe */
.tooltip.bs-tooltip-auto[x-placement^='top'] .arrow::before,
.tooltip.bs-tooltip-top .arrow::before {
  border-top-color: #555; /* Pfeilfarbe an den Hintergrund anpassen */
}
</style>
