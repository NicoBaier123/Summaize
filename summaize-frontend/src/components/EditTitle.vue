<template>
  <div class="title-container">
    <input
      type="text"
      v-model="localTitle"
      class="title-input"
      :class="{ editing: isEditing }"
      :readonly="!isEditing"
      @click="startEdit"
      @blur="handleBlur"
      ref="titleInput"
      :placeholder="'Titel eingeben...'"
    />
    <button
      v-if="isEditing"
      class="confirm-edit-button"
      @click="saveTitle"
      title="Änderungen speichern"
    >
      <i class="fas fa-check"></i>
    </button>
    <span v-if="isSaving" class="saving-indicator">Speichern...</span>
  </div>
</template>

<script>
import { ref, watch, nextTick } from 'vue'

export default {
  name: 'EditTitle',
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    cardSetId: {
      type: [String, Number],
      required: true,
    },
    // TODO: Später durch Login-Session ersetzen
    userId: {
      type: [String, Number],
      default: 1,
    },
  },
  emits: ['update:modelValue'],
  setup(props) {
    const localTitle = ref(props.modelValue)
    const isEditing = ref(false)
    const isSaving = ref(false)
    const titleInput = ref(null)

    watch(
      () => props.modelValue,
      newTitle => {
        if (!isEditing.value) {
          localTitle.value = newTitle
        }
      },
    )

    const startEdit = async () => {
      if (!isEditing.value) {
        isEditing.value = true
        await nextTick()
        titleInput.value?.focus()
      }
    }

    const handleBlur = async event => {
      if (event.relatedTarget?.classList.contains('confirm-edit-button')) {
        return
      }

      if (localTitle.value !== props.modelValue) {
        await saveTitle()
      }
      isEditing.value = false
    }

    // In EditTitle.vue
    const saveTitle = async () => {
      console.log('Sending request:', {
        url: `/api/users/${props.userId}/card-sets/${props.cardSetId}`,
        title: localTitle.value,
      })

      const response = await fetch(
        `/api/users/${props.userId}/card-sets/${props.cardSetId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: localTitle.value.trim() }),
        },
      )

      if (!response.ok) {
        const error = await response.json()
        console.error('Error response:', error)
        throw new Error(error.message || 'Failed to update title')
      }

      const data = await response.json()
      console.log('Success response:', data)
      return data
    }

    return {
      localTitle,
      isEditing,
      isSaving,
      titleInput,
      startEdit,
      handleBlur,
      saveTitle,
    }
  },
}
</script>

<style scoped>
.title-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-input {
  font-size: 1.5rem;
  font-weight: 600;
  padding: 8px 12px;
  border: 1px solid transparent;
  border-radius: 6px;
  background-color: transparent;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 500px;
  cursor: pointer;
}

.title-input:hover:not(.editing) {
  background-color: #f8f9fa;
}

.title-input.editing {
  border-color: #dee2e6;
  background-color: white;
  cursor: text;
}

.title-input.editing:focus {
  outline: none;
  border-color: #0d6efd;
  box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
}

.confirm-edit-button {
  background: none;
  border: none;
  color: #198754;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-edit-button:hover {
  background-color: #e8f5e9;
}

.confirm-edit-button:active {
  transform: scale(0.95);
}

.saving-indicator {
  font-size: 0.875rem;
  color: #6c757d;
  font-style: italic;
}
</style>
