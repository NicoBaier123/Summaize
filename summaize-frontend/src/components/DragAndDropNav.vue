<template>
    <div class="mt-3">
      <button class="btn btn-secondary me-2" @click="$emit('clear-input')" :disabled="!fileSelected">
        Input Löschen
      </button>
      <button class="btn btn-primary" @click="$emit('start-analysis')" :disabled="!fileSelected">
        Analyse starten
      </button>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      fileSelected: {
        type: Boolean,
        required: true
      }
    }
  }
  </script>