<template>
  <main class="landing-page">
    <section class="landing-card">
      <p class="eyebrow">{{ t('landing.eyebrow') }}</p>
      <h1>{{ t('landing.title') }}</h1>
      <p class="description">{{ t('landing.description') }}</p>

      <nav class="link-grid" aria-label="Primary sections">
        <NuxtLink v-for="item in destinations" :key="item.to" :to="item.to" class="link-card">
          <span class="link-card__title">{{ item.label }}</span>
          <span class="link-card__hint">{{ t('landing.linkHint') }}</span>
        </NuxtLink>
      </nav>
    </section>
  </main>
</template>

<script setup lang="ts">
const { t } = useI18n()

const destinations = [
  { to: '/hotels', label: t('landing.hotels') },
  { to: '/flights', label: t('landing.flights') },
  { to: '/full-trip', label: t('landing.fullTrip') }
]
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
}

.landing-card {
  width: min(100%, 52rem);
  padding: 2.5rem;
  border-radius: 1.75rem;
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
  font-size: clamp(2.25rem, 4vw, 4rem);
}

.description {
  margin: 1rem 0 0;
  color: #334155;
}

.link-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.link-card {
  display: grid;
  gap: 0.35rem;
  padding: 1.25rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  text-decoration: none;
  color: inherit;
  background: #f8fafc;
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.link-card:hover {
  transform: translateY(-2px);
  border-color: #cbd5e1;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
}

.link-card__title {
  font-size: 1.05rem;
  font-weight: 700;
}

.link-card__hint {
  font-size: 0.875rem;
  color: #64748b;
}
</style>