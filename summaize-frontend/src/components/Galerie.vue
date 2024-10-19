<template>
    <div class="galerie-sidebar">
      <div class="scroll-container">
        <div v-for="set in sortedCardSets" :key="set.id" class="preview-tile" @click="loadSet(set.id)">
          <img :src="set.preview_image_url" :alt="set.title" class="preview-image">
          <p class="set-title">{{ set.title }}</p>
        </div>
        <div class="preview-tile add-new" @click="goToCreateNew">
          <span class="plus-icon">+</span>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  
  export default {
    name: 'GalerieSidebar',
    setup() {
      const router = useRouter();
      const cardSets = ref([]);
  
      const sortedCardSets = computed(() => {
        return [...cardSets.value].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      });
  
      const loadCardSets = async () => {
        try {
          const response = await fetch('http://localhost:3000/api/card-sets');
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          cardSets.value = await response.json();
        } catch (error) {
          console.error('Error loading card sets:', error);
        }
      };
  
      const loadSet = (setId) => {
        router.push({ name: 'DisplayCard', params: { id: setId } });
      };
  
      const goToCreateNew = () => {
        router.push({ name: 'DragAndDropView' });
      };
  
      onMounted(loadCardSets);
  
      return {
        sortedCardSets,
        loadSet,
        goToCreateNew
      };
    }
  };
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