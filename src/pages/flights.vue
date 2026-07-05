<template>
  <main class="section-page">
    <h1>{{ t('sections.flights.title') }}</h1>
  </main>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>

<style scoped>
.section-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.25rem);
}
</style>