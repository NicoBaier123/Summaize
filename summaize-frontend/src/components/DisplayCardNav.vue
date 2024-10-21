<template>
  <div class="card-nav">
    <button @click="$emit('previous')" :disabled="isFirst">Vorherige</button>
    <button @click="$emit('flip')">Umdrehen</button>
    <button @click="$emit('next')" :disabled="isLast">Nächste</button>
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
  justify-content: space-between;
  margin-top: 20px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
