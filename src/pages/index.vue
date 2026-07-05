<template>
  <main class="home-page">
    <AppHero :app-name="appName" :api-base-url="apiBaseUrl" />
  </main>
</template>

<script setup lang="ts">
const { appName, apiBaseUrl } = useAppEnvironment()
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
}
</style>