<template>
  <div id="app">
    <NavBar
      class="navbar"
      :isAuthenticated="isAuthenticated"
      @logout="handleLogout"
    />
    <div class="content-wrapper">
      <RouterView
        class="router-view"
        :class="{ 'sidebar-open': isSidebarOpen && isAuthenticated }"
        @login-success="handleLoginSuccess"
      />
      <template v-if="isAuthenticated">
        <Galerie
          ref="galerieRef"
          class="galerie-sidebar"
          :class="{ open: isSidebarOpen }"
          @modal-state="handleModalState"
          v-show="showGalerie"
        />
        <button
          v-show="!isModalOpen && showGalerie"
          @click="toggleSidebar"
          class="sidebar-toggle btn btn-light"
          :class="{ open: isSidebarOpen }"
        >
          <i
            class="bi"
            :class="isSidebarOpen ? 'bi-chevron-right' : 'bi-chevron-left'"
          ></i>
        </button>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, provide, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from './components/NavBar.vue'
import Galerie from '@/components/Galerie.vue'

export default {
  name: 'App',
  components: {
    NavBar,
    Galerie,
  },
  setup() {
    const router = useRouter()
    const isSidebarOpen = ref(true)
    const galerieRef = ref(null)
    const isModalOpen = ref(false)
    const isAuthenticated = ref(false)
    const showGalerie = ref(false)

    const handleLoginSuccess = async () => {
      console.log('Login success handler called')

      // Direkt den Auth-Status setzen
      isAuthenticated.value = true
      showGalerie.value = true

      // Warte auf den nächsten Tick
      await nextTick()

      // Lade die Galerie
      if (galerieRef.value?.loadCardSets) {
        galerieRef.value.loadCardSets()
      }

      // Navigiere zur Hauptseite
      if (router.currentRoute.value.path === '/login') {
        console.log('Navigating to home...')
        await router.push('/')
      }
    }

    const checkAuthentication = () => {
      console.log('Checking authentication...')

      try {
        // Prüfe auf Token in verschiedenen Formaten
        const cookies = document.cookie.split(';').map(c => c.trim())

        console.log('All cookies:', cookies)

        const hasToken = cookies.some(c => c.startsWith('token='))

        console.log('Has token:', hasToken)

        isAuthenticated.value = hasToken
        showGalerie.value = hasToken

        return hasToken
      } catch (error) {
        console.error('Error checking authentication:', error)
        return false
      }
    }

    const handleLogout = async () => {
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        })

        isAuthenticated.value = false
        showGalerie.value = false

        // Lösche das Cookie
        document.cookie =
          'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax'

        if (!response.ok) {
          console.error('Logout failed on server')
        }

        router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
        router.push('/login')
      }
    }

    onMounted(async () => {
      await checkAuthentication()
    })

    // Watch für Route-Änderungen
    watch(
      () => router.currentRoute.value.path,
      async () => {
        await checkAuthentication()
      },
    )

    const handleModalState = state => {
      isModalOpen.value = state
    }

    const toggleSidebar = () => {
      isSidebarOpen.value = !isSidebarOpen.value
    }

    provide('reloadGallery', () => {
      if (galerieRef.value?.loadCardSets) {
        galerieRef.value.loadCardSets()
      }
    })

    provide('isAuthenticated', isAuthenticated)

    return {
      isSidebarOpen,
      toggleSidebar,
      galerieRef,
      isModalOpen,
      handleModalState,
      isAuthenticated,
      handleLogout,
      showGalerie,
      handleLoginSuccess,
    }
  },
}
</script>
<style>
html,
body {
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
  top: 10vh;
  right: 0;
  z-index: 1001;
  border: none;
  border-radius: 4px 0 0 4px;
  padding: 10px 5px;
  cursor: pointer;
  transition:
    right 0.3s ease,
    background-color 0.3s ease;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
}

.sidebar-toggle:hover {
  background-color: #e9ecef;
}

.sidebar-toggle.open {
  right: 250px;
}

.sidebar-toggle .bi {
  font-size: 1rem;
}
</style>
