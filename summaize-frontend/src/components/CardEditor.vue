<template>
  <div class="card-editor" v-if="card">
    <CardSide
      title="Vorderseite"
      :content="editedCard.front_content"
      :is-editing="editingFront"
      placeholder="Vorderseite der Karte..."
      @update:content="updateFrontContent"
      @toggle-edit="$emit('toggle-edit', 'front')"
    />
    <CardSide
      title="Rückseite"
      :content="editedCard.back_content"
      :is-editing="editingBack"
      placeholder="Rückseite der Karte..."
      @update:content="updateBackContent"
      @toggle-edit="$emit('toggle-edit', 'back')"
    />
  </div>
  <div v-else class="no-card-selected">
    <p>Wählen Sie eine Karte aus oder erstellen Sie eine neue</p>
  </div>
</template>

<script>
import CardSide from './CardSide.vue'

export default {
  name: 'CardEditor',
  components: {
    CardSide,
  },
  props: {
    card: {
      type: Object,
      default: null,
    },
    editedCard: {
      type: Object,
      required: true,
    },
    editingFront: {
      type: Boolean,
      default: false,
    },
    editingBack: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    updateFrontContent(content) {
      this.$emit('update:editedCard', {
        ...this.editedCard,
        front_content: content,
      })
    },
    updateBackContent(content) {
      this.$emit('update:editedCard', {
        ...this.editedCard,
        back_content: content,
      })
    },
  },
}
</script>

<style scoped>
.card-editor {
  display: flex;
  gap: 24px;
  margin-top: 16px;
  animation: fadeIn 0.3s ease;
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .card-editor {
    flex-direction: column;
  }
}
</style>
