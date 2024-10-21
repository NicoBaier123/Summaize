<template>
  <div class="galerie-sidebar">
    <div class="scroll-container">
      <!--div mit einer Plus-Icon, welches ein neues Set erstellt, soll ganz oben sein-->
      <div class="preview-tile add-new" @click="goToCreateNew">
        <span class="plus-icon">+</span>
      </div>
      <!-- v-for loop to display card sets
        :key="set.id" setzt eine Keyvariabel mit der id des Sets
        @click="loadSet(set.id)" Nach Click wird das Set an hand der ID geladen-->
      <div
        v-for="set in sortedCardSets"
        :key="set.id"
        class="preview-tile"
        @click="loadSet(set.id)"
      >
        <!--setzt die src (source) des Vorschaubildes die als Attribut hinterlegte Image-URL
            Auch die Alt Beschreibung soll dem Set entnommen werden -->
        <img
          :src="set.preview_image_url"
          :alt="set.title"
          class="preview-image"
        />
        <!--setzt den Titel des Sets, aus einem Attribut des Sets-->
        <p class="set-title">{{ set.title }}</p>
      </div>
    </div>
  </div>
</template>

<script>
// Importieren der benötigten Funktionen aus Vue und Vue Router
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  // Der Name der Komponente, wichtig für Debugging und DevTools
  name: 'GalerieSidebar',

  // Die setup()-Funktion ist der Einstiegspunkt für die Composition API in Vue 3
  setup() {
    // useRouter() gibt das Router-Objekt zurück, das Methoden für die programmatische Navigation bereitstellt.
    // Mit diesem Objekt können wir zwischen verschiedenen Routen (Ansichten) in unserer Anwendung navigieren,
    // ohne dass wir die URLs manuell manipulieren müssen. Es ermöglicht uns, Funktionen wie router.push()
    // zu verwenden, um den Benutzer zu verschiedenen Teilen der Anwendung zu leiten.
    const router = useRouter()

    // Erstellung einer reaktiven Referenz für die Kartensätze
    // ref() macht den Wert reaktiv, sodass Vue Änderungen erkennen und darauf reagieren kann
    const cardSets = ref([])

    // Berechnung einer sortierten Version der Kartensätze
    // computed() erstellt einen abgeleiteten Wert, der sich automatisch aktualisiert, wenn sich cardSets ändert
    const sortedCardSets = computed(() => {
      // Sortieren der Kartensätze nach dem Aktualisierungsdatum (neueste zuerst)
      // [...cardSets.value] erstellt eine Kopie des Arrays, um das Original nicht zu verändern
      return [...cardSets.value].sort(
        (a, b) => new Date(b.updated_at) - new Date(a.updated_at),
      )
    })

    // Asynchrone Funktion zum Laden der Kartensätze von der Backend-API
    const loadCardSets = async () => {
      try {
        const userId = 1
        console.log('Fetching card sets for user:', userId)

        const response = await fetch(`/api/users/${userId}/card-sets`, {
          headers: {
            // Header hier...
          },
        })

        console.log('Response status:', response.status)
        console.log('Response headers:', response.headers)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Error response:', errorText)
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${errorText}`,
          )
        }

        const data = await response.json()
        console.log('Received data:', data)
        cardSets.value = data
      } catch (error) {
        console.error('Error loading card sets:', error)
      }
    }

    // Funktion zum Laden eines spezifischen Kartensatzes
    // Navigiert zur DisplayCard-Ansicht mit der ID des ausgewählten Satzes
    const loadSet = setId => {
      router.push({ name: 'DisplayCard', params: { id: setId } })
    }

    // Funktion zur Navigation zur Erstellungsansicht für neue Kartensätze
    const goToCreateNew = () => {
      router.push({ name: 'newSet' })
    }

    // onMounted-Hook: Wird aufgerufen, wenn die Komponente in den DOM eingehängt wird
    // Hier wird die loadCardSets-Funktion aufgerufen, um die Daten initial zu laden
    onMounted(loadCardSets)

    // Rückgabe der Werte und Funktionen, die im Template verwendet werden sollen
    return {
      sortedCardSets,
      loadSet,
      goToCreateNew,
    }
  },
}
</script>

<style scoped>
.galerie-sidebar {
  width: 250px;
  height: 100vh;
  overflow-y: auto;
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
}

.scroll-container {
  padding: 15px;
}

.preview-tile {
  width: 100%;
  aspect-ratio: 1;
  margin-bottom: 15px;
  cursor: pointer;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.set-title {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 5px;
  margin: 0;
  font-size: 0.8rem;
  text-align: center;
}

.add-new {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #e9ecef;
}

.plus-icon {
  font-size: 2rem;
  color: #6c757d;
}
</style>
