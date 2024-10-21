<template>
  <div class="display-card-view">
    <h1>{{ cardSet?.title }}</h1>
    <div v-if="currentCard">
      <DisplayCard :card="currentCard" ref="displayCard" />
      <DisplayCardNav
        @previous="previousCard"
        @flip="flipCard"
        @next="nextCard"
        :isFirst="currentIndex === 0"
        :isLast="currentIndex === cardSet.cards.length - 1"
      />
    </div>
    <div v-else-if="isCompleted">
      <p>Herzlichen Glückwunsch, dieser Stapel ist erledigt!</p>
    </div>
    <div v-else>
      <p>Laden...</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import DisplayCard from '../components/DisplayCard.vue'
import DisplayCardNav from '../components/DisplayCardNav.vue'

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
    const route = useRoute()
    const cardSet = ref(null)
    const currentIndex = ref(0)
    const isCompleted = ref(false)
    const displayCard = ref(null)

    // Fest verdrahtete userId wie in der Galerie-Komponente
    const userId = 1

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
        currentIndex.value = 0 // Reset index when loading new set
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

    // Wenn sich die ID ändert (entweder durch prop oder route), lade das Set neu
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
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}
</style>
