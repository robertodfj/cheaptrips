<template>
  <section class="hero-card">
    <p class="eyebrow">{{ t('home.eyebrow') }}</p>
    <h1>{{ appName }}</h1>
    <p class="description">
      {{ t('home.description') }}
    </p>

    <dl class="env-list">
      <div>
        <dt>{{ t('home.apiBaseUrlLabel') }}</dt>
        <dd>{{ apiBaseUrl || t('home.apiBaseUrlEmpty') }}</dd>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()

defineProps<{
  appName: string
  apiBaseUrl: string
}>()
</script>

<style scoped>
.hero-card {
  width: min(100%, 42rem);
  padding: 2rem;
  border-radius: 1.5rem;
  background: white;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
}

.eyebrow {
  margin: 0 0 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.75rem;
  color: #64748b;
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.5rem);
}

.description {
  margin: 1rem 0 0;
  color: #334155;
}

.env-list {
  margin: 1.5rem 0 0;
}

dt {
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f172a;
}

dd {
  margin: 0.25rem 0 0;
  color: #475569;
}
</style>