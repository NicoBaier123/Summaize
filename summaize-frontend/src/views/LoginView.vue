<template>
  <div class="login-container">
    <div class="card login-card">
      <div class="card-body">
        <h2 class="card-title text-center mb-4">
          {{ isRegistering ? 'Register' : 'Login' }}
        </h2>

        <form @submit.prevent="handleSubmit">
          <!-- Username/Email Field -->
          <div class="mb-3">
            <label for="login" class="form-label">Username or Email</label>
            <input
              type="text"
              class="form-control"
              id="login"
              v-model="formData.login"
              required
            />
          </div>

          <!-- Email Field (only for registration) -->
          <div v-if="isRegistering" class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input
              type="email"
              class="form-control"
              id="email"
              v-model="formData.email"
              required
            />
          </div>

          <!-- Password Field -->
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input
              type="password"
              class="form-control"
              id="password"
              v-model="formData.password"
              required
            />
          </div>

          <!-- Error Message -->
          <div v-if="error" class="alert alert-danger" role="alert">
            {{ error }}
          </div>

          <!-- Submit Button -->
          <button type="submit" class="btn btn-primary w-100 mb-3">
            {{ isRegistering ? 'Register' : 'Login' }}
          </button>

          <!-- Toggle Register/Login -->
          <p class="text-center mb-0">
            {{
              isRegistering
                ? 'Already have an account?'
                : "Don't have an account?"
            }}
            <a href="#" @click.prevent="toggleMode">
              {{ isRegistering ? 'Login' : 'Register' }}
            </a>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'

export default {
  name: 'LoginView',
  emits: ['login-success'],
  setup(props, { emit }) {
    const isRegistering = ref(false)
    const error = ref('')
    const formData = reactive({
      login: '',
      email: '',
      password: '',
    })

    const handleSubmit = async () => {
      try {
        error.value = ''
        if (isRegistering.value) {
          await register()
        } else {
          await login()
        }
      } catch (err) {
        console.error('Submit error:', err)
        error.value = err.message
      }
    }

    const register = async () => {
      try {
        const registerResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
          credentials: 'include',
        })

        if (!registerResponse.ok) {
          const data = await registerResponse.json()
          throw new Error(data.error || 'Registration failed')
        }

        // Nach erfolgreicher Registrierung einloggen
        await login()
      } catch (error) {
        console.error('Registration error:', error)
        throw error
      }
    }

    const login = async () => {
      try {
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            login: formData.login,
            password: formData.password,
          }),
          credentials: 'include', // Wichtig für Cookies
        })

        if (!loginResponse.ok) {
          const data = await loginResponse.json()
          throw new Error(data.error || 'Login failed')
        }

        const data = await loginResponse.json()

        if (data.token) {
          console.log('Login successful, emitting success event')
          emit('login-success')
        } else {
          throw new Error('No token received')
        }
      } catch (error) {
        console.error('Login error:', error)
        error.value = error.message
        throw error
      }
    }
    const toggleMode = () => {
      isRegistering.value = !isRegistering.value
      error.value = ''
      formData.login = ''
      formData.email = ''
      formData.password = ''
    }

    return {
      isRegistering,
      formData,
      error,
      handleSubmit,
      toggleMode,
    }
  },
}
</script>

<style scoped>
.login-container {
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #f8f9fa;
}

.login-card {
  width: 100%;
  max-width: 400px;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  border: none;
  border-radius: 0.5rem;
  background-color: white;
}

.login-card .card-body {
  padding: 2.5rem;
}

.card-title {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.form-label {
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.5rem;
}

.form-control {
  padding: 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #ced4da;
  transition:
    border-color 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.btn-primary {
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.2s ease-in-out;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.alert {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 0.375rem;
}

a {
  color: #0d6efd;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease-in-out;
}

a:hover {
  color: #0a58ca;
  text-decoration: underline;
}

@media (max-width: 576px) {
  .login-card {
    margin: 1rem;
  }

  .login-card .card-body {
    padding: 1.5rem;
  }
}
</style>
