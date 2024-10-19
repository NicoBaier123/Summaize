<template>
    <div>
      <div
        class="drag-and-drop border border-3 border-dashed p-5 text-center bg-light rounded shadow-sm"
        @dragover.prevent="onDragOver"
        @drop.prevent="onDrop"
        @click="triggerFileInput"
      >
        <template v-if="!selectedFile">
          <i class="bi bi-file-earmark-pdf fs-1 mb-3"></i>
          <p class="mb-0">Ziehe deine PDF-Datei hierher oder klicke, um eine Datei auszuwählen.</p>
        </template>
        <template v-else>
          <i class="bi bi-file-earmark-pdf fs-1 mb-3 text-primary"></i>
          <h4 class="mb-0">{{ selectedFile.name }}</h4>
          <p class="text-muted mt-2">Klicke, um eine andere Datei auszuwählen</p>
        </template>
        <input
          type="file"
          ref="fileInput"
          @change="onFileChange"
          style="display:none"
          accept="application/pdf"
        />
      </div>
      <DragAndDropNav
        @clear-input="clearInput"
        @start-analysis="startAnalysis"
        :file-selected="!!selectedFile"
      />
    </div>
  </template>
  
  <script>
  import DragAndDropNav from './DragAndDropNav.vue';
  
  export default {
    components: {
      DragAndDropNav
    },
    data() {
      return {
        selectedFile: null
      };
    },
    methods: {
      onDragOver(event) {
        event.dataTransfer.dropEffect = 'copy';
      },
      onDrop(event) {
        const files = event.dataTransfer.files;
        if (files.length > 0 && files[0].type === 'application/pdf') {
          this.handleFiles(files[0]);
        } else {
          alert('Bitte nur eine PDF-Datei hochladen.');
        }
      },
      onFileChange(event) {
        const files = event.target.files;
        if (files.length > 0 && files[0].type === 'application/pdf') {
          this.handleFiles(files[0]);
        } else {
          alert('Bitte nur eine PDF-Datei hochladen.');
        }
      },
      handleFiles(file) {
        this.selectedFile = file;
      },
      triggerFileInput() {
        this.$refs.fileInput.click();
      },
      clearInput() {
        this.selectedFile = null;
        this.$refs.fileInput.value = '';
      },
      startAnalysis() {
        if (this.selectedFile) {
          // Hier den Code zum Senden der Datei an das Backend einfügen
          const formData = new FormData();
          formData.append('pdf', this.selectedFile);
  
          // Beispiel für einen API-Aufruf mit axios:
          // axios.post('/api/analyze-pdf', formData)
          //   .then(response => {
          //     console.log('Analyse gestartet', response);
          //   })
          //   .catch(error => {
          //     console.error('Fehler beim Starten der Analyse', error);
          //   });
  
          console.log('Analyse gestartet für:', this.selectedFile.name);
        } else {
          alert('Bitte zuerst eine PDF-Datei auswählen.');
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .drag-and-drop {
    transition: all 0.3s ease;
    min-height: 200px; /* Ensures consistent height */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .drag-and-drop:hover {
    background-color: #e9ecef !important;
    cursor: pointer;
  }
  </style>