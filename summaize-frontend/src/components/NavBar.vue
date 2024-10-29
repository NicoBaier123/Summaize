<template>
  <nav
    class="navbar navbar-expand-lg bg-dark border-bottom border-secondary py-3"
    data-bs-theme="dark"
  >
    <div class="container-fluid px-4">
      <!-- Left side with logo and links -->
      <div class="d-flex align-items-center">
        <router-link
          class="navbar-brand fw-bold fs-3 text-white me-5 hover-zoom"
          to="/"
        >
          SummAize
        </router-link>

        <!-- Navigation Links with Hover Effects - Only show when authenticated -->
        <div v-if="isAuthenticated" class="navbar-nav gap-4">
          <router-link
            class="nav-link fs-5 position-relative custom-underline"
            to="/about"
          >
            About
          </router-link>
          <router-link
            class="nav-link fs-5 position-relative custom-underline"
            to="/admin"
          >
            Admin
          </router-link>
        </div>
      </div>

      <!-- Right side with Profile Dropdown -->
      <div class="dropdown">
        <div
          class="d-flex align-items-center"
          role="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i class="bi bi-person-circle text-white fs-2 hover-zoom"></i>
        </div>

        <!-- Dropdown Menu -->
        <ul class="dropdown-menu dropdown-menu-end">
          <li v-if="!isAuthenticated">
            <router-link class="dropdown-item" to="/login">
              <i class="bi bi-box-arrow-in-right me-2"></i>
              Login
            </router-link>
          </li>
          <li v-else>
            <a class="dropdown-item" href="#" @click.prevent="$emit('logout')">
              <i class="bi bi-box-arrow-right me-2"></i>
              Logout
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'NavBar',
  props: {
    isAuthenticated: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['logout'],
}
</script>

<style scoped>
/* Hover-Zoom Effect */
.hover-zoom {
  transition: transform 0.2s ease;
  cursor: pointer;
}

.hover-zoom:hover {
  transform: scale(1.1);
}

/* Custom Underline Animation for Nav-Links */
.custom-underline::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: 0;
  left: 0;
  background-color: #fff;
  transition: width 0.3s ease;
}

.custom-underline:hover::after {
  width: 100%;
}

/* Active Link Styling */
.router-link-active.custom-underline::after {
  width: 100%;
}

/* Dropdown Styling */
.dropdown-menu {
  min-width: 200px;
  margin-top: 0.5rem;
  padding: 0.5rem 0;
  background-color: #2c3e50;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.2);
}

.dropdown-item {
  color: #fff;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.dropdown-item i {
  font-size: 1.1rem;
}

/* Make dropdown items white when active */
.dropdown-item.active,
.dropdown-item:active {
  background-color: rgba(255, 255, 255, 0.2);
  color: #fff;
}
</style>
