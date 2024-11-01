<template>
  <div class="overlay" @click="$emit('close')">
    <div class="upload-container" @click.stop>
      <div
        class="drop-zone"
        @drop.prevent="handleDrop"
        @dragover.prevent="dragover = true"
        @dragleave.prevent="dragover = false"
        :class="{ dragover: dragover }"
      >
        <div v-if="previewUrl" class="preview-wrapper">
          <img :src="previewUrl" alt="Vorschau" class="preview-image" />
          <button class="remove-button" @click="removeImage">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <div v-else class="upload-prompt" @click="triggerFileInput">
          <i class="fas fa-cloud-upload-alt"></i>
          <p>Ziehe ein Bild hierher oder klicke zum Auswählen</p>
          <input
            type="file"
            ref="fileInput"
            class="file-input"
            accept="image/*"
            @change="handleFileSelect"
          />
        </div>
      </div>
      <div v-if="uploadError" class="error-message">
        {{ uploadError }}
      </div>
      <div v-if="isUploading" class="upload-status">
        <div class="spinner"></div>
        <span>Upload läuft...</span>
      </div>
      <div class="actions">
        <button
          class="save-button"
          :disabled="!selectedFile || isUploading"
          @click="uploadImage"
        >
          Speichern
        </button>
        <button
          v-if="currentImage && !selectedFile"
          class="delete-button"
          :disabled="isUploading"
          @click="deleteCurrentImage"
        >
          Bild löschen
        </button>
        <button
          class="cancel-button"
          :disabled="isUploading"
          @click="$emit('close')"
        >
          Abbrechen
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'ImageUploadOverlay',

  props: {
    cardSetId: {
      type: [String, Number],
      required: true,
    },
    currentImage: {
      type: String,
      default: null,
    },
  },

  emits: ['close', 'update:image'],

  setup(props, { emit }) {
    const fileInput = ref(null)
    const selectedFile = ref(null)
    const dragover = ref(false)
    const previewUrl = ref(props.currentImage)
    const uploadError = ref('')
    const isUploading = ref(false)

    watch(
      () => props.currentImage,
      newValue => {
        if (!selectedFile.value) {
          previewUrl.value = newValue
        }
      },
    )

    const triggerFileInput = () => {
      fileInput.value.click()
    }

    const handleFileSelect = event => {
      const file = event.target.files[0]
      if (file) {
        processFile(file)
      }
    }

    const handleDrop = event => {
      dragover.value = false
      const file = event.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) {
        processFile(file)
      } else {
        uploadError.value = 'Bitte nur Bilddateien hochladen'
      }
    }

    const processFile = file => {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB Limit
        uploadError.value = 'Die Datei ist zu groß (maximal 5MB)'
        return
      }
      uploadError.value = ''
      selectedFile.value = file
      const reader = new FileReader()
      reader.onload = e => {
        previewUrl.value = e.target.result
      }
      reader.readAsDataURL(file)
    }

    const uploadImage = async () => {
      if (!selectedFile.value) return

      isUploading.value = true
      uploadError.value = ''

      try {
        const formData = new FormData()
        formData.append('image', selectedFile.value)

        const response = await fetch(
          `/api/card-sets/${props.cardSetId}/preview-image`,
          {
            method: 'POST',
            body: formData,
          },
        )

        if (!response.ok) throw new Error('Upload fehlgeschlagen')

        const result = await response.json()
        emit('update:image', result.preview_image_blob)
        emit('close')
      } catch (error) {
        console.error('Error uploading image:', error)
        uploadError.value = 'Fehler beim Upload. Bitte versuchen Sie es erneut.'
      } finally {
        isUploading.value = false
      }
    }

    const deleteCurrentImage = async () => {
      if (!confirm('Möchten Sie das aktuelle Bild wirklich löschen?')) return

      isUploading.value = true
      uploadError.value = ''

      try {
        const response = await fetch(
          `/api/card-sets/${props.cardSetId}/preview-image`,
          {
            method: 'DELETE',
          },
        )

        if (!response.ok) throw new Error('Löschen fehlgeschlagen')

        emit('update:image', null)
        emit('close')
      } catch (error) {
        console.error('Error deleting image:', error)
        uploadError.value = 'Fehler beim Löschen des Bildes'
      } finally {
        isUploading.value = false
      }
    }

    const removeImage = () => {
      selectedFile.value = null
      previewUrl.value = props.currentImage
      uploadError.value = ''
    }

    return {
      fileInput,
      selectedFile,
      dragover,
      previewUrl,
      uploadError,
      isUploading,
      triggerFileInput,
      handleFileSelect,
      handleDrop,
      uploadImage,
      deleteCurrentImage,
      removeImage,
    }
  },
}
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.upload-container {
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
}

.drop-zone {
  border: 2px dashed #dee2e6;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.drop-zone.dragover {
  border-color: #0d6efd;
  background-color: #e9ecef;
}

.upload-prompt {
  color: #6c757d;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-prompt i {
  font-size: 2rem;
  margin-bottom: 10px;
}

.file-input {
  display: none;
}

.preview-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.remove-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-button:hover {
  background-color: #bb2d3b;
}

.error-message {
  color: #dc3545;
  margin-top: 12px;
  text-align: center;
  font-size: 0.9rem;
}

.upload-status {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.save-button,
.cancel-button,
.delete-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-button {
  background-color: #0d6efd;
  color: white;
}

.save-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.save-button:not(:disabled):hover {
  background-color: #0b5ed7;
}

.delete-button {
  background-color: #dc3545;
  color: white;
}

.delete-button:hover:not(:disabled) {
  background-color: #bb2d3b;
}

.cancel-button {
  background-color: #e9ecef;
  color: #495057;
}

.cancel-button:hover:not(:disabled) {
  background-color: #dee2e6;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
