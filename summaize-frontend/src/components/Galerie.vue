<template>
  <div class="galerie-sidebar">
    <!-- Modal Overlay für neue Set-Erstellung -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h2>Neues Karteikartenset erstellen</h2>
        <div class="modal-buttons">
          <button class="modal-button pdf-button" @click="createFromPDF">
            <i class="fas fa-file-pdf"></i>
            PDF importieren
          </button>
          <button class="modal-button new-button" @click="showTitleInput">
            <i class="fas fa-plus"></i>
            Neues Set erstellen
          </button>
        </div>
        <!-- Title Input Form -->
        <div v-if="showTitlePrompt" class="title-input-container">
          <input
            v-model="newSetTitle"
            type="text"
            placeholder="Titel des Sets eingeben"
            class="title-input"
            @keyup.enter="createNewSet"
          />
          <div class="input-buttons">
            <button
              class="create-button"
              @click="createNewSet"
              :disabled="!newSetTitle.trim()"
            >
              Erstellen
            </button>
            <button class="cancel-button" @click="cancelTitleInput">
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Toast -->
    <div
      v-if="showSuccessToast"
      class="success-toast"
      @click="showSuccessToast = false"
    >
      <div class="toast-content">
        <i class="fas fa-check-circle"></i>
        <span>Karteikartenset wurde gelöscht</span>
      </div>
    </div>

    <div class="scroll-container">
      <!-- Add New Button -->
      <div class="preview-tile add-new" @click="showModal">
        <span class="plus-icon">+</span>
      </div>

      <!-- Card Set Previews -->
      <div v-for="set in sortedCardSets" :key="set.id" class="preview-tile">
        <div class="edit-icon" @click.stop="editSet(set.id)">
          <i class="fas fa-pen"></i>
        </div>
        <div class="delete-icon" @click.stop="deleteSet(set.id)">
          <i class="fas fa-trash"></i>
        </div>
        <div class="tile-content" @click="loadSet(set.id)">
          <img
            v-if="set.preview_image_blob"
            :src="set.preview_image_blob"
            :alt="set.title"
            class="preview-image"
          />
          <div v-else class="preview-placeholder">
            <i class="fas fa-image"></i>
          </div>
          <p class="set-title">{{ set.title }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'GalerieSidebar',
  emits: ['modal-state'], // Neue emit Deklaration

  setup(props, { emit }) {
    const router = useRouter()
    const cardSets = ref([])
    const showCreateModal = ref(false)
    const showTitlePrompt = ref(false)
    const newSetTitle = ref('')
    const showSuccessToast = ref(false)
    const userId = 1

    const sortedCardSets = computed(() => {
      return [...cardSets.value].sort(
        (a, b) => new Date(b.updated_at) - new Date(a.updated_at),
      )
    })

    const loadCardSets = async () => {
      try {
        console.log('Loading card sets...')
        const response = await fetch(`/api/users/${userId}/card-sets`)
        if (!response.ok) {
          const errorText = await response.text()
          const errorMessage = `HTTP error! status: ${response.status}, message: ${errorText}`
          console.error(errorMessage)
          throw new Error(errorMessage)
        }
        const data = await response.json()
        console.log('Card sets loaded:', data)
        cardSets.value = data
      } catch (error) {
        console.error('Error loading card sets:', error)
      }
    }

    const getPreviewImage = set => {
      if (set.preview_image_blob) {
        // Convert blob data to base64 URL
        return `data:image/jpeg;base64,${set.preview_image_blob}`
      }
      return '/img/Deutsche_Staedte.jpg'
    }

    const showModal = () => {
      showCreateModal.value = true
      showTitlePrompt.value = false
      newSetTitle.value = ''
      emit('modal-state', true)
    }

    const closeModal = () => {
      showCreateModal.value = false
      showTitlePrompt.value = false
      newSetTitle.value = ''
      emit('modal-state', false)
    }

    const showTitleInput = () => {
      showTitlePrompt.value = true
    }

    const cancelTitleInput = () => {
      showTitlePrompt.value = false
      newSetTitle.value = ''
    }

    const createFromPDF = () => {
      closeModal()
      router.push({ name: 'newSet' })
    }

    const createNewSet = async () => {
      if (!newSetTitle.value.trim()) return

      try {
        const response = await fetch(`/api/users/${userId}/card-sets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            title: newSetTitle.value.trim(),
          }),
        })

        if (!response.ok) {
          const errorData = await response.text()
          console.error(
            `HTTP error! status: ${response.status}, message:`,
            errorData,
          )
          throw new Error('Fehler beim Erstellen des Sets')
        }

        const newSet = await response.json()
        await loadCardSets() // Reload card sets after creating new one

        closeModal()
        router.push({ name: 'EditCardSet', params: { id: newSet.id } })
      } catch (error) {
        console.error('Error creating new set:', error)
      }
    }

    const deleteSet = async setId => {
      if (!confirm('Möchten Sie dieses Karteikartenset wirklich löschen?'))
        return

      try {
        const response = await fetch(
          `/api/users/${userId}/card-sets/${setId}`,
          {
            method: 'DELETE',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          },
        )

        if (!response.ok) {
          throw new Error('Fehler beim Löschen des Sets')
        }

        // Set aus der lokalen Liste entfernen
        cardSets.value = cardSets.value.filter(set => set.id !== setId)

        // Toast anzeigen
        showSuccessToast.value = true

        setTimeout(() => {
          showSuccessToast.value = false
          loadCardSets() // Reload statt window.location.reload()
        }, 1000)
      } catch (error) {
        console.error('Error deleting set:', error)
      }
    }

    const loadSet = setId => {
      router.push({ name: 'DisplayCard', params: { id: setId } })
    }

    const editSet = setId => {
      router.push({ name: 'EditCardSet', params: { id: setId } })
    }

    onMounted(() => {
      console.log('Galerie mounted, loading card sets...')
      loadCardSets()
    })

    return {
      sortedCardSets,
      showCreateModal,
      showTitlePrompt,
      newSetTitle,
      showSuccessToast,
      loadSet,
      editSet,
      deleteSet,
      showModal,
      closeModal,
      createFromPDF,
      showTitleInput,
      cancelTitleInput,
      createNewSet,
      loadCardSets,
      getPreviewImage,
    }
  },
}
</script>

<style scoped>
.galerie-sidebar {
  width: 250px;
  height: 100vh;
  overflow-y: auto;
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
}

.scroll-container {
  padding: 15px;
}

.preview-tile {
  width: 100%;
  aspect-ratio: 1;
  margin-bottom: 15px;
  cursor: pointer;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  background-color: #f8f9fa;
}

.tile-content {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  color: #adb5bd;
  font-size: 2rem;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #f8f9fa;
}

.set-title {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 8px;
  margin: 0;
  font-size: 0.8rem;
  text-align: center;
  z-index: 1;
}

.edit-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.delete-icon {
  position: absolute;
  top: 8px;
  right: 48px;
  width: 32px;
  height: 32px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.edit-icon:hover {
  background-color: #fff;
  transform: scale(1.1);
}

.delete-icon:hover {
  background-color: #ff4444;
  color: white;
  transform: scale(1.1);
}

.add-new {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #e9ecef;
  transition: background-color 0.3s ease;
}

.add-new:hover {
  background-color: #dee2e6;
}

.plus-icon {
  font-size: 2rem;
  color: #6c757d;
}

/* Success Toast */
.success-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #198754;
  color: white;
  padding: 12px 20px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
}

.toast-content i {
  font-size: 1.1rem;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.modal-button {
  padding: 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.pdf-button {
  background-color: #e9ecef;
  color: #495057;
}

.new-button {
  background-color: #198754;
  color: white;
}

.pdf-button:hover {
  background-color: #dee2e6;
}

.new-button:hover {
  background-color: #157347;
}

.title-input-container {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #dee2e6;
}

.title-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  margin-bottom: 12px;
  font-size: 1rem;
}

.input-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.create-button,
.cancel-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.create-button {
  background-color: #0d6efd;
  color: white;
}

.create-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.cancel-button {
  background-color: #e9ecef;
  color: #495057;
}

.create-button:not(:disabled):hover {
  background-color: #0b5ed7;
}

.cancel-button:hover {
  background-color: #dee2e6;
}
</style>
