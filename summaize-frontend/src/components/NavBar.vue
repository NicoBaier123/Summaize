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
        </div>
      </div>

      <!-- Right side with Profile Dropdown - Only show when authenticated -->
      <div v-if="isAuthenticated" class="profile-dropdown">
        <div class="d-flex align-items-center" @click="toggleDropdown">
          <i class="bi bi-person-circle text-white fs-2 hover-zoom"></i>
        </div>

        <!-- Dropdown Menu -->
        <div class="profile-dropdown-menu" :class="{ show: isDropdownOpen }">
          <a class="dropdown-item" href="#" @click.prevent="$emit('logout')">
            <i class="bi bi-box-arrow-right me-2"></i>
            Logout
          </a>
        </div>
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
  data() {
    return {
      isDropdownOpen: false,
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen
    },
    handleClickOutside(event) {
      const dropdown = event.target.closest('.profile-dropdown')
      if (!dropdown && this.isDropdownOpen) {
        this.isDropdownOpen = false
      }
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
.profile-dropdown {
  position: relative;
}

.profile-dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 200px;
  background-color: #2c3e50;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.2);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s ease;
}

.profile-dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  color: #fff;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  text-decoration: none;
}

.dropdown-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.dropdown-item i {
  font-size: 1.1rem;
}

.dropdown-item.active,
.dropdown-item:active {
  background-color: rgba(255, 255, 255, 0.2);
  color: #fff;
}
</style>
