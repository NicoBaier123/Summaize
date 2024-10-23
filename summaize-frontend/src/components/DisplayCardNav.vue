<template>
  <div class="card-nav">
    <button
      class="nav-button"
      @click="$emit('previous')"
      :disabled="isFirst"
      :class="{ disabled: isFirst }"
    >
      &#8592; Vorherige
    </button>
    <button class="nav-button flip-button" @click="$emit('flip')">
      Umdrehen
    </button>
    <button
      class="nav-button"
      @click="$emit('next')"
      :disabled="isLast"
      :class="{ disabled: isLast }"
    >
      Nächste &#8594;
    </button>
  </div>
</template>

<script>
export default {
  name: 'DisplayCardNav',
  props: {
    isFirst: {
      type: Boolean,
      default: false,
    },
    isLast: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['previous', 'flip', 'next'],
}
</script>

<style scoped>
.card-nav {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  padding: 0 20px;
}

.nav-button {
  padding: 12px 24px;
  font-size: 1rem;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  background-color: #f8f9fa;
  color: #495057;
  transition: all 0.3s ease;
  min-width: 120px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-button:hover:not(.disabled) {
  background-color: #e9ecef;
  transform: translateY(-2px);
}

.nav-button:active:not(.disabled) {
  transform: translateY(0);
}

.flip-button {
  background-color: #e9ecef;
  font-weight: 500;
}

.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
