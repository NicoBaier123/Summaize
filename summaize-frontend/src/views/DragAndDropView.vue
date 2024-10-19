<template>
    <div class="main-view">
      <h1 class="display-4">Welcome to SummAIze</h1>
      <DragAndDrop />
    </div>
  </template>
  
  <script>
  import DragAndDrop from '@/components/DragAndDrop.vue';
  
  export default {
    name: 'DragAndDropView',
    components: {
      DragAndDrop
    }
  }
  </script>
  
  <style scoped>
  /* Add custom styles here */
  </style>
  