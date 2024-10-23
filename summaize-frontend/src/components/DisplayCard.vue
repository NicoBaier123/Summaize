<template>
  <div class="card" @click="flip">
    <div :class="['card-inner', { 'is-flipped': isFlipped }]">
      <div class="card-face card-front">
        <p>{{ card.front_content }}</p>
      </div>
      <div class="card-face card-back">
        <p>{{ card.back_content }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'DisplayCard',
  props: {
    card: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const isFlipped = ref(false)

    const flip = () => {
      isFlipped.value = !isFlipped.value
    }

    return {
      isFlipped,
      flip,
    }
  },
}
</script>

<style scoped>
.card {
  width: 300px;
  height: 200px;
  perspective: 1000px;
  cursor: pointer;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.is-flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 20px;
  box-sizing: border-box;
}

.card-front {
  background-color: #f8f9fa;
}

.card-back {
  background-color: #e9ecef;
  transform: rotateY(180deg);
}
</style>
