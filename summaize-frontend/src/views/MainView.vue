<template>
  <div class="main-view">
    <h1 class="display-4">Welcome to SummAIze</h1>
    <div class="content-wrapper">
      <div class="main-content">
        <DisplayCard />
      </div>
      <Galerie class="galerie-sidebar" />
    </div>
  </div>
</template>

<script>
import DisplayCard from '@/components/DisplayCard.vue';

export default {
  name: 'MainView',
  components: {
    DisplayCard
  }
}
</script>

<style scoped>
.main-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

h1 {
  padding: 20px;
  margin: 0;
}

.content-wrapper {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}


</style>