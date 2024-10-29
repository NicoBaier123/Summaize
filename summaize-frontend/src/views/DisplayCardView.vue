<template>
  <div class="display-card-view">
    <div class="content-wrapper">
      <h1 class="title">{{ cardSet?.title }}</h1>
      <div v-if="currentCard" class="card-container">
        <DisplayCard :card="currentCard" ref="displayCard" />
        <DisplayCardNav
          @previous="previousCard"
          @flip="flipCard"
          @next="nextCard"
          :isFirst="currentIndex === 0"
          :isLast="currentIndex === cardSet.cards.length - 1"
        />
      </div>
      <div v-else-if="isCompleted" class="completion-message">
        <h2>🎉 Herzlichen Glückwunsch!</h2>
        <p>Dieser Stapel ist erledigt!</p>
      </div>
      <div v-else class="loading">
        <p>Laden...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import DisplayCard from '../components/DisplayCard.vue'
import DisplayCardNav from '../components/DisplayCardNav.vue'
import { getTokenData } from '../utils/token'

export default {
  name: 'DisplayCardView',
  components: {
    DisplayCard,
    DisplayCardNav,
  },
  props: {
    id: {
      type: [String, Number],
      default: null,
    },
  },
  setup(props) {
    const userId = getTokenData('id')
    const route = useRoute()
    const cardSet = ref(null)
    const currentIndex = ref(0)
    const isCompleted = ref(false)
    const displayCard = ref(null)

    const fetchCardSet = async setId => {
      if (!setId) return

      try {
        console.log(`Fetching card set ${setId} for user ${userId}`)
        const response = await fetch(
          `/api/users/${userId}/card-sets/${setId}`,
          {
            headers: {
              // Falls benötigt, können hier zusätzliche Header hinzugefügt werden
            },
          },
        )

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Error response:', errorText)
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${errorText}`,
          )
        }

        const data = await response.json()
        console.log('Received card set data:', data)
        cardSet.value = data
        currentIndex.value = 0
        isCompleted.value = false
      } catch (error) {
        console.error('Error fetching card set:', error)
      }
    }

    const currentCard = computed(() => {
      if (!cardSet.value?.cards?.length) return null
      return cardSet.value.cards[currentIndex.value]
    })

    const nextCard = () => {
      if (!cardSet.value?.cards) return
      if (currentIndex.value < cardSet.value.cards.length - 1) {
        currentIndex.value++
        isCompleted.value = false
      } else {
        isCompleted.value = true
      }
    }

    const previousCard = () => {
      if (currentIndex.value > 0) {
        currentIndex.value--
        isCompleted.value = false
      }
    }

    const flipCard = () => {
      displayCard.value?.flip()
    }

    watch(
      () => props.id || route.params.id,
      newId => {
        if (newId) {
          fetchCardSet(newId)
        }
      },
      { immediate: true },
    )

    return {
      cardSet,
      currentCard,
      currentIndex,
      isCompleted,
      nextCard,
      previousCard,
      flipCard,
      displayCard,
    }
  },
}
</script>
<style scoped>
.display-card-view {
  position: fixed; /* Fixierte Position für Overlay über Sidebar */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  z-index: 0; /* Niedrigerer z-index als die Sidebar */
}

.content-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  height: 100%;
  box-sizing: border-box;
}

.title {
  font-size: clamp(1.2rem, 2vw, 1.5rem);
  color: #212529;
  text-align: center;
  margin: 0;
  padding: 8px 0;
  flex-shrink: 0;
  min-height: 40px; /* Feste Mindesthöhe für die Überschrift */
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-container {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px; /* Reduzierter Abstand zwischen Karte und Navigation */
  min-height: 0;
  padding: 8px 0;
  margin: auto 0; /* Vertikale Zentrierung */
}

/* Anpassung der DisplayCard-Komponente */
:deep(.card) {
  height: calc(
    100vh - 180px
  ); /* Dynamische Höhe basierend auf Viewport minus Header und Navigation */
  max-height: 500px; /* Maximale Höhe */
  min-height: 300px; /* Minimale Höhe */
  transition: height 0.3s ease;
}

.completion-message {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin: auto;
}

.completion-message h2 {
  color: #212529;
  margin-bottom: 8px;
  font-size: clamp(1.1rem, 2vw, 1.3rem);
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
}

/* Medienabfragen für verschiedene Bildschirmgrößen */
@media (max-height: 600px) {
  .content-wrapper {
    padding: 8px;
  }

  .title {
    font-size: 1.1rem;
    min-height: 32px;
  }

  :deep(.card) {
    height: calc(100vh - 140px);
    min-height: 200px;
  }
}

@media (max-width: 480px) {
  .content-wrapper {
    padding: 8px;
  }

  .title {
    font-size: 1.1rem;
  }
}

/* Für sehr große Bildschirme */
@media (min-width: 1920px) {
  .content-wrapper {
    max-width: 1800px;
    margin: 0 auto;
  }

  :deep(.card) {
    max-height: 600px;
  }
}
</style>
