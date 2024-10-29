<template>
  <div class="edit-card-view">
    <CardsSidebar
      :cards="cards"
      :current-card-id="currentCard?.id"
      @add-card="addNewCard"
      @select-card="selectCard"
      @delete-card="deleteCard"
      @toggle-image-upload="showImageUpload = true"
    />

    <ImageUploadOverlay
      v-if="showImageUpload"
      :card-set-id="cardSetId"
      :current-image="cardSet?.preview_image_blob"
      @close="showImageUpload = false"
      @update:image="handleImageUpdate"
    />

    <div class="editor-main">
      <div class="editor-header">
        <div class="title-wrapper">
          <EditTitle
            v-if="cardSet"
            v-model="cardSetTitle"
            :card-set-id="cardSetId"
            :user-id="userId"
            @error="handleError"
            @title-updated="handleTitleUpdate"
          />
        </div>
        <button
          class="save-button"
          @click="saveChanges"
          :disabled="!hasChanges"
        >
          Speichern
        </button>
      </div>

      <div v-if="loading" class="loading-state">Lade Kartenset...</div>

      <CardEditor
        v-else-if="currentCard"
        :card="currentCard"
        :edited-card="editedCard"
        :editing-front="editingFront"
        :editing-back="editingBack"
        @update:edited-card="updateEditedCard"
        @toggle-edit="toggleEdit"
      />

      <div v-else-if="cards.length === 0" class="empty-state">
        Keine Karten vorhanden. Klicken Sie auf "+" um eine neue Karte
        hinzuzufügen.
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CardsSidebar from '../components/CardsSidebar.vue'
import CardEditor from '../components/CardEditor.vue'
import EditTitle from '../components/EditTitle.vue'
import ImageUploadOverlay from '../components/ImageUploadOverlay.vue'
import { getTokenData } from '../utils/token'

export default {
  name: 'EditCardView',
  components: {
    CardsSidebar,
    CardEditor,
    EditTitle,
    ImageUploadOverlay,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const userId = getTokenData('id')
    const loading = ref(true)
    const cardSetId = computed(() => route.params.id)

    // Inject der Galerie-Reload Funktion
    const reloadGallery = inject('reloadGallery')

    const cardSet = ref(null)
    const cards = ref([])
    const currentCard = ref(null)
    const editedCard = ref({ front_content: '', back_content: '' })
    const editingFront = ref(false)
    const editingBack = ref(false)
    const hasChanges = ref(false)
    const showImageUpload = ref(false)

    const handleImageUpdate = async () => {
      await fetchCardSet() // Lade das Kartenset neu um das neue Bild zu sehen
      if (reloadGallery) {
        reloadGallery() // Aktualisiere die Galerie wenn vorhanden
      }
    }

    const cardSetTitle = computed({
      get: () => cardSet.value?.title || '',
      set: newValue => {
        if (cardSet.value) {
          cardSet.value.title = newValue
        }
      },
    })

    const fetchCardSet = async () => {
      loading.value = true
      try {
        const response = await fetch(
          `/api/users/${userId}/card-sets/${cardSetId.value}`,
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('Received card set data:', data)

        cardSet.value = {
          id: data.id,
          title: data.title,
          preview_image_url: data.preview_image_url,
        }

        cards.value = data.cards || []

        if (cards.value.length > 0) {
          selectCard(cards.value[0])
        }
      } catch (error) {
        console.error('Error fetching card set:', error)
        handleError('Fehler beim Laden des Kartensets')
        router.push('/') // Zurück zur Hauptseite bei Fehler
      } finally {
        loading.value = false
      }
    }

    const handleError = error => {
      console.error('Error:', error)
    }

    // Neue Funktion zum Behandeln des Title-Update Events
    const handleTitleUpdate = () => {
      if (reloadGallery) {
        reloadGallery()
      }
    }

    const selectCard = card => {
      currentCard.value = card
      editedCard.value = { ...card }
      editingFront.value = false
      editingBack.value = false
      hasChanges.value = false
    }

    const addNewCard = () => {
      const newCard = {
        id: 'temp_' + Date.now(),
        card_set_id: cardSetId.value,
        front_content: '',
        back_content: '',
      }
      cards.value.push(newCard)
      selectCard(newCard)
      editingFront.value = true
      editingBack.value = true
    }

    const deleteCard = async cardId => {
      if (!confirm('Möchten Sie diese Karte wirklich löschen?')) return

      try {
        const response = await fetch(`/api/cards/${cardId}`, {
          method: 'DELETE',
        })
        if (!response.ok) {
          throw new Error('Failed to delete card')
        }
        cards.value = cards.value.filter(card => card.id !== cardId)
        if (currentCard.value?.id === cardId) {
          currentCard.value = cards.value[0] || null
          if (currentCard.value) {
            selectCard(currentCard.value)
          }
        }
      } catch (error) {
        console.error('Error deleting card:', error)
        handleError('Fehler beim Löschen der Karte')
      }
    }

    const toggleEdit = side => {
      if (side === 'front') {
        editingFront.value = !editingFront.value
      } else {
        editingBack.value = !editingBack.value
      }
    }

    const updateEditedCard = newValue => {
      editedCard.value = newValue
      hasChanges.value = true
    }

    const saveChanges = async () => {
      if (!currentCard.value) return

      try {
        const isNew = String(currentCard.value.id).startsWith('temp_')
        const endpoint = isNew
          ? `/api/card-sets/${cardSetId.value}/cards`
          : `/api/cards/${currentCard.value.id}`

        const response = await fetch(endpoint, {
          method: isNew ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editedCard.value),
        })

        if (!response.ok) {
          throw new Error('Failed to save card')
        }

        const savedCard = await response.json()

        if (isNew) {
          const index = cards.value.findIndex(
            card => card.id === currentCard.value.id,
          )
          if (index !== -1) {
            cards.value[index] = savedCard
            currentCard.value = savedCard
          }
        } else {
          Object.assign(currentCard.value, editedCard.value)
        }

        hasChanges.value = false
        editingFront.value = false
        editingBack.value = false
      } catch (error) {
        console.error('Error saving card:', error)
        handleError('Fehler beim Speichern der Karte')
      }
    }

    watch(
      () => route.params.id,
      (newId, oldId) => {
        if (newId !== oldId) {
          fetchCardSet()
        }
      },
      { immediate: true },
    )

    onMounted(() => {
      if (cardSetId.value) {
        fetchCardSet()
      }
    })

    return {
      cardSet,
      cardSetId,
      cardSetTitle,
      cards,
      currentCard,
      editedCard,
      editingFront,
      editingBack,
      hasChanges,
      loading,
      userId,
      handleError,
      handleTitleUpdate, // Neue Funktion zum Return hinzugefügt
      selectCard,
      addNewCard,
      deleteCard,
      toggleEdit,
      updateEditedCard,
      saveChanges,
      showImageUpload,
      handleImageUpdate,
    }
  },
}
</script>

<style scoped>
.loading-state,
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #6c757d;
  font-size: 1.1rem;
}

.edit-card-view {
  display: flex;
  height: 100vh;
  background-color: #f8f9fa;
}

.editor-main {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.title-wrapper {
  flex: 1;
  margin-right: 16px;
}

.save-button {
  padding: 8px 16px;
  background-color: #198754;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.save-button:not(:disabled):hover {
  background-color: #157347;
}

.save-button:active:not(:disabled) {
  transform: scale(0.98);
}

@media (max-width: 768px) {
  .edit-card-view {
    flex-direction: column;
  }

  .editor-main {
    padding: 16px;
  }

  .editor-header {
    flex-direction: column;
    gap: 12px;
  }

  .title-wrapper {
    width: 100%;
    margin-right: 0;
  }
}
</style>
