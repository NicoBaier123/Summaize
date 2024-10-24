<template>
  <div class="edit-card-view">
    <!-- Linke Sidebar mit Kartenliste -->
    <div class="cards-sidebar">
      <div class="sidebar-header">
        <h3>Kartenliste</h3>
        <button class="add-card-button" @click="addNewCard" title="Neue Karte">
          <i class="fas fa-plus"></i>
        </button>
      </div>
      <div class="cards-list">
        <div
          v-for="(card, index) in cards"
          :key="card.id"
          :class="['card-list-item', { active: currentCard?.id === card.id }]"
          @click="selectCard(card)"
        >
          <span class="card-number">{{ index + 1 }}</span>
          <span class="card-preview">{{
            truncateText(card.front_content)
          }}</span>
          <button
            class="delete-card-button"
            @click.stop="deleteCard(card.id)"
            title="Karte löschen"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Hauptbereich mit Karteneditor -->
    <div class="editor-main">
      <div class="editor-header">
        <h2>{{ cardSet?.title }} bearbeiten</h2>
        <button
          class="save-button"
          @click="saveChanges"
          :disabled="!hasChanges"
        >
          Speichern
        </button>
      </div>

      <div class="card-editor" v-if="currentCard">
        <div class="card-side">
          <div class="side-header">
            <h3>Vorderseite</h3>
            <button
              class="edit-toggle"
              @click="toggleEdit('front')"
              :class="{ active: editingFront }"
            >
              <i class="fas fa-pen"></i>
            </button>
          </div>
          <textarea
            v-if="editingFront"
            v-model="editedCard.front_content"
            class="content-editor"
            placeholder="Vorderseite der Karte..."
          ></textarea>
          <div v-else class="content-preview">
            {{ currentCard.front_content }}
          </div>
        </div>

        <div class="card-side">
          <div class="side-header">
            <h3>Rückseite</h3>
            <button
              class="edit-toggle"
              @click="toggleEdit('back')"
              :class="{ active: editingBack }"
            >
              <i class="fas fa-pen"></i>
            </button>
          </div>
          <textarea
            v-if="editingBack"
            v-model="editedCard.back_content"
            class="content-editor"
            placeholder="Rückseite der Karte..."
          ></textarea>
          <div v-else class="content-preview">
            {{ currentCard.back_content }}
          </div>
        </div>
      </div>

      <div v-else class="no-card-selected">
        <p>Wählen Sie eine Karte aus oder erstellen Sie eine neue</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'EditCardView',

  setup() {
    const route = useRoute()
    const router = useRouter()
    const userId = 1 // Feste userId wie in anderen Komponenten

    const cardSet = ref(null)
    const cards = ref([])
    const currentCard = ref(null)
    const editedCard = ref({ front_content: '', back_content: '' })
    const editingFront = ref(false)
    const editingBack = ref(false)
    const hasChanges = ref(false)

    // Laden des Kartensets und der Karten
    const fetchCardSet = async () => {
      try {
        const setId = route.params.id
        const response = await fetch(`/api/users/${userId}/card-sets/${setId}`)
        const data = await response.json()
        cardSet.value = data
        cards.value = data.cards
      } catch (error) {
        console.error('Error fetching card set:', error)
      }
    }

    // Karte zur Bearbeitung auswählen
    const selectCard = card => {
      currentCard.value = card
      editedCard.value = { ...card }
      editingFront.value = false
      editingBack.value = false
      hasChanges.value = false
    }

    // Neue Karte hinzufügen
    const addNewCard = () => {
      const newCard = {
        id: 'temp_' + Date.now(),
        card_set_id: route.params.id,
        front_content: '',
        back_content: '',
      }
      cards.value.push(newCard)
      selectCard(newCard)
      editingFront.value = true
      editingBack.value = true
    }

    // Karte löschen
    const deleteCard = async cardId => {
      if (!confirm('Möchten Sie diese Karte wirklich löschen?')) return

      try {
        await fetch(`/api/cards/${cardId}`, {
          method: 'DELETE',
        })
        cards.value = cards.value.filter(card => card.id !== cardId)
        if (currentCard.value?.id === cardId) {
          currentCard.value = null
        }
      } catch (error) {
        console.error('Error deleting card:', error)
      }
    }

    // Bearbeitungsmodus umschalten
    const toggleEdit = side => {
      if (side === 'front') {
        editingFront.value = !editingFront.value
      } else {
        editingBack.value = !editingBack.value
      }
    }

    // Änderungen speichern
    const saveChanges = async () => {
      try {
        const isNew = String(currentCard.value.id).startsWith('temp_')
        const endpoint = isNew
          ? `/api/card-sets/${route.params.id}/cards`
          : `/api/cards/${currentCard.value.id}`

        const response = await fetch(endpoint, {
          method: isNew ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editedCard.value),
        })

        const savedCard = await response.json()

        if (isNew) {
          cards.value = cards.value.map(card =>
            card.id === currentCard.value.id ? savedCard : card,
          )
        } else {
          Object.assign(currentCard.value, editedCard.value)
        }

        hasChanges.value = false
        editingFront.value = false
        editingBack.value = false
      } catch (error) {
        console.error('Error saving card:', error)
      }
    }

    // Hilfsfunktion zum Kürzen des Textes
    const truncateText = text => {
      return text?.length > 30 ? text.substring(0, 27) + '...' : text
    }

    // Initial laden
    fetchCardSet()

    return {
      cardSet,
      cards,
      currentCard,
      editedCard,
      editingFront,
      editingBack,
      hasChanges,
      selectCard,
      addNewCard,
      deleteCard,
      toggleEdit,
      saveChanges,
      truncateText,
    }
  },
}
</script>

<style scoped>
.edit-card-view {
  display: flex;
  height: 100vh;
  background-color: #f8f9fa;
}

.cards-sidebar {
  width: 300px;
  border-right: 1px solid #dee2e6;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-card-button {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #6c757d;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.add-card-button:hover {
  background-color: #f8f9fa;
  color: #212529;
}

.cards-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.card-list-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 4px;
  background-color: #fff;
  border: 1px solid #dee2e6;
  transition: all 0.2s ease;
}

.card-list-item:hover {
  background-color: #f8f9fa;
}

.card-list-item.active {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

.card-number {
  min-width: 24px;
  margin-right: 12px;
  color: #6c757d;
}

.card-preview {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-card-button {
  opacity: 0;
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.card-list-item:hover .delete-card-button {
  opacity: 1;
}

.delete-card-button:hover {
  background-color: #fee2e2;
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

.card-editor {
  display: flex;
  gap: 24px;
  margin-top: 16px;
}

.card-side {
  flex: 1;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.side-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.edit-toggle {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.edit-toggle:hover {
  background-color: #f8f9fa;
}

.edit-toggle.active {
  color: #0d6efd;
  background-color: #e7f1ff;
}

.content-editor {
  width: 100%;
  min-height: 200px;
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  resize: vertical;
  font-size: 1rem;
  line-height: 1.5;
}

.content-preview {
  min-height: 200px;
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background-color: #f8f9fa;
  white-space: pre-wrap;
}

.no-card-selected {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #6c757d;
  font-size: 1.1rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .card-editor {
    flex-direction: column;
  }

  .card-side {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .edit-card-view {
    flex-direction: column;
  }

  .cards-sidebar {
    width: 100%;
    height: 200px;
  }

  .editor-main {
    padding: 16px;
  }
}

/* Scrollbar Styling */
.cards-list::-webkit-scrollbar {
  width: 8px;
}

.cards-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.cards-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.cards-list::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* Animationen */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.card-editor {
  animation: fadeIn 0.3s ease;
}

/* Zusätzliche Interaktive Elemente */
.content-editor:focus {
  outline: none;
  border-color: #0d6efd;
  box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
}

.card-list-item:active {
  transform: scale(0.98);
}

/* Verbessertes Feedback für Buttons */
.edit-toggle:active,
.add-card-button:active,
.delete-card-button:active {
  transform: scale(0.95);
}

.save-button:active:not(:disabled) {
  transform: scale(0.98);
}
</style>
