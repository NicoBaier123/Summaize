<!-- DragAndDropView.vue -->
<template>
  <div class="container py-4">
    <div class="row mb-4">
      <div class="col text-center">
        <h1 class="display-5 fw-bold text-primary">Drop your PDF</h1>
      </div>
    </div>

    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-7 col-xl-6">
        <div class="card border-light">
          <DragAndDrop />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DragAndDrop from '@/components/DragAndDrop.vue'

export default {
  name: 'DragAndDropView',
  components: {
    DragAndDrop,
  },
}
</script>

<style scoped>
.card {
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
}
</style>
