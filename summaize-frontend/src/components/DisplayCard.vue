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
  width: min(80vw, 800px);
  height: 100%; /* Statt der festen Höhe */
  perspective: 1000px;
  cursor: pointer;
  margin: 0 auto;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.8s;
  transform-style: preserve-3d;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  border: none;
  border-radius: 15px;
  padding: 30px;
  box-sizing: border-box;
  font-size: 1.2rem;
  line-height: 1.6;
}

.card-front {
  background-color: #ffffff;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.05);
}

.card-back {
  background-color: #f8f9fa;
  transform: rotateY(180deg);
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.05);
}
</style>
