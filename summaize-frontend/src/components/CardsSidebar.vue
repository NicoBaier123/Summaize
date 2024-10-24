<template>
  <div class="cards-sidebar">
    <div class="sidebar-header">
      <h3>Kartenliste</h3>
      <button
        class="add-card-button"
        @click="$emit('add-card')"
        title="Neue Karte"
      >
        <i class="fas fa-plus"></i>
      </button>
    </div>
    <div class="cards-list">
      <div
        v-for="(card, index) in cards"
        :key="card.id"
        :class="['card-list-item', { active: currentCardId === card.id }]"
        @click="$emit('select-card', card)"
      >
        <span class="card-number">{{ index + 1 }}</span>
        <span class="card-preview">{{ truncateText(card.front_content) }}</span>
        <button
          class="delete-card-button"
          @click.stop="$emit('delete-card', card.id)"
          title="Karte löschen"
        >
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CardsSidebar',
  props: {
    cards: {
      type: Array,
      required: true,
    },
    currentCardId: {
      type: [String, Number],
      default: null,
    },
  },
  methods: {
    truncateText(text) {
      return text?.length > 30 ? text.substring(0, 27) + '...' : text
    },
  },
}
</script>

<style scoped>
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

.add-card-button:active {
  transform: scale(0.95);
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

.card-list-item:active {
  transform: scale(0.98);
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

.delete-card-button:active {
  transform: scale(0.95);
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

/* Responsive Design */
@media (max-width: 768px) {
  .cards-sidebar {
    width: 100%;
    height: 200px;
  }
}
</style>
