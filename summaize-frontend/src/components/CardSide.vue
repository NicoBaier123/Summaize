<template>
  <div class="card-side">
    <div class="side-header">
      <h3>{{ title }}</h3>
      <button
        class="edit-toggle"
        @click="$emit('toggle-edit')"
        :class="{ active: isEditing }"
      >
        <i class="fas fa-pen"></i>
      </button>
    </div>
    <textarea
      v-if="isEditing"
      :value="content"
      @input="$emit('update:content', $event.target.value)"
      class="content-editor"
      :placeholder="placeholder"
    ></textarea>
    <div v-else class="content-preview">
      {{ content }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'CardSide',
  props: {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      default: '',
    },
    isEditing: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: '',
    },
  },
}
</script>

<style scoped>
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

.edit-toggle:active {
  transform: scale(0.95);
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

.content-editor:focus {
  outline: none;
  border-color: #0d6efd;
  box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
}

.content-preview {
  min-height: 200px;
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background-color: #f8f9fa;
  white-space: pre-wrap;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .card-side {
    width: 100%;
  }
}
</style>
