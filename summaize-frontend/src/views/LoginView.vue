<template>
  <div
    class="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center"
  >
    <div class="card shadow-lg" style="min-width: 300px; max-width: 400px">
      <div class="card-body p-4">
        <!-- Tabs für Login/Register -->
        <ul class="nav nav-pills mb-4" role="tablist">
          <li class="nav-item flex-fill" role="presentation">
            <button
              class="nav-link w-100"
              :class="{ active: activeTab === 'login' }"
              @click="activeTab = 'login'"
            >
              Login
            </button>
          </li>
          <li class="nav-item flex-fill" role="presentation">
            <button
              class="nav-link w-100"
              :class="{ active: activeTab === 'register' }"
              @click="activeTab = 'register'"
            >
              Registrieren
            </button>
          </li>
        </ul>

        <!-- Login Formular -->
        <div v-if="activeTab === 'login'" class="fade show">
          <form @submit.prevent="handleLogin">
            <div class="mb-3">
              <label for="loginEmail" class="form-label"
                >E-Mail oder Benutzername</label
              >
              <input
                type="string"
                class="form-control"
                id="loginEmail"
                v-model="loginForm.login"
                required
              />
            </div>
            <div class="mb-4">
              <label for="loginPassword" class="form-label">Passwort</label>
              <input
                type="password"
                class="form-control"
                id="loginPassword"
                v-model="loginForm.password"
                required
              />
            </div>
            <button type="submit" class="btn btn-primary w-100">
              Anmelden
            </button>
          </form>
        </div>

        <!-- Register Formular -->
        <div v-if="activeTab === 'register'" class="fade show">
          <form @submit.prevent="handleRegister">
            <div class="mb-3">
              <label for="registerName" class="form-label">Name</label>
              <input
                type="text"
                class="form-control"
                id="registerName"
                v-model="registerForm.login"
                required
              />
            </div>
            <div class="mb-3">
              <label for="registerEmail" class="form-label">E-Mail</label>
              <input
                type="email"
                class="form-control"
                id="registerEmail"
                v-model="registerForm.email"
                required
              />
            </div>
            <div class="mb-3">
              <label for="registerPassword" class="form-label">Passwort</label>
              <input
                type="password"
                class="form-control"
                id="registerPassword"
                v-model="registerForm.password"
                required
              />
            </div>
            <div class="mb-4">
              <label for="registerPasswordConfirm" class="form-label"
                >Passwort bestätigen</label
              >
              <input
                type="password"
                class="form-control"
                id="registerPasswordConfirm"
                v-model="registerForm.passwordConfirm"
                required
              />
            </div>
            <button type="submit" class="btn btn-primary w-100">
              Registrieren
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginView',
  data() {
    return {
      activeTab: 'login',
      loginForm: {
        login: '',
        password: '',
      },
      registerForm: {
        login: '',
        email: '',
        password: '',
        passwordConfirm: '',
      },
    }
  },
  methods: {
    async handleLogin() {
      try {
        fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.loginForm),
        })
        console.log('Login Daten:', this.loginForm)
      } catch (error) {
        console.error('Login fehlgeschlagen:', error)
      }
    },
    async handleRegister() {
      if (this.registerForm.password !== this.registerForm.passwordConfirm) {
        alert('Passwörter stimmen nicht überein!')
        return
      }

      try {
        fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.registerForm),
        })
        console.log('Register Daten:', this.registerForm)
      } catch (error) {
        console.error('Registrierung fehlgeschlagen:', error)
      }
    },
  },
}
</script>

<style scoped>
.card {
  border: none;
  border-radius: 1rem;
}

.nav-pills .nav-link {
  border-radius: 0.5rem;
  color: #6c757d;
}

.nav-pills .nav-link.active {
  background-color: #0d6efd;
  color: white;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.btn-primary {
  padding: 0.75rem;
  font-weight: 500;
  border-radius: 0.5rem;
}

.fade {
  transition: opacity 0.15s linear;
}

.fade.show {
  opacity: 1;
}
</style>
