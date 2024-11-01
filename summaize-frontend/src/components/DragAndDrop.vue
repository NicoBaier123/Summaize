<template>
  <div>
    <div
      class="drag-and-drop p-5 text-center"
      @dragover.prevent="onDragOver"
      @drop.prevent="onDrop"
      @click="triggerFileInput"
    >
      <template v-if="!selectedFile">
        <i class="bi bi-file-earmark-pdf display-3 mb-3 text-secondary"></i>
        <p class="mb-0 text-secondary">
          Ziehe deine PDF-Datei hierher oder klicke, um eine Datei auszuwählen.
        </p>
      </template>
      <template v-else>
        <i class="bi bi-file-earmark-pdf display-3 mb-3 text-primary"></i>
        <h4 class="mb-2 text-primary">{{ selectedFile.name }}</h4>
        <p class="text-muted small mb-0">
          Klicke, um eine andere Datei auszuwählen
        </p>
      </template>
      <input
        type="file"
        ref="fileInput"
        @change="onFileChange"
        style="display: none"
        accept="application/pdf"
      />
    </div>
    <DragAndDropNav
      @clear-input="clearInput"
      @start-analysis="startAnalysis"
      :file-selected="!!selectedFile"
      class="p-4"
    />
  </div>
</template>

<script>
import DragAndDropNav from './DragAndDropNav.vue'

export default {
  components: {
    DragAndDropNav,
  },
  data() {
    return {
      selectedFile: null,
    }
  },
  methods: {
    onDragOver(event) {
      event.dataTransfer.dropEffect = 'copy'
    },
    onDrop(event) {
      const files = event.dataTransfer.files
      if (files.length > 0 && files[0].type === 'application/pdf') {
        this.handleFiles(files[0])
      } else {
        alert('Bitte nur eine PDF-Datei hochladen.')
      }
    },
    onFileChange(event) {
      const files = event.target.files
      if (files.length > 0 && files[0].type === 'application/pdf') {
        this.handleFiles(files[0])
      } else {
        alert('Bitte nur eine PDF-Datei hochladen.')
      }
    },
    handleFiles(file) {
      this.selectedFile = file
    },
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    clearInput() {
      this.selectedFile = null
      this.$refs.fileInput.value = ''
    },
    startAnalysis() {
      if (this.selectedFile) {
        const formData = new FormData()
        formData.append('pdf', this.selectedFile)
        console.log('Analyse gestartet für:', this.selectedFile.name)
      } else {
        alert('Bitte zuerst eine PDF-Datei auswählen.')
      }
    },
  },
}
</script>

<style scoped>
.drag-and-drop {
  transition: all 0.2s ease;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.drag-and-drop:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
  cursor: pointer;
}

.bi-file-earmark-pdf {
  transition: transform 0.2s ease;
}

.drag-and-drop:hover .bi-file-earmark-pdf {
  transform: scale(1.1);
}
</style>
