<template>
  <div class="d-flex justify-content-end gap-2">
    <button
      class="btn btn-outline-secondary"
      @click="$emit('clear-input')"
      :disabled="!fileSelected"
    >
      Input Löschen
    </button>
    <button
      class="btn btn-primary"
      @click="$emit('start-analysis')"
      :disabled="!fileSelected"
    >
      Analyse starten
    </button>
  </div>
</template>

<script>
export default {
  name: 'DragAndDropNav',
  props: {
    fileSelected: {
      type: Boolean,
      required: true,
    },
  },
}
</script>
