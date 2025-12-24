<template>
  <div class="placeholder-page fade-in">
    <h1>New Opportunities</h1>
    <p class="subtitle">This area will help you identify and track new business opportunities from your meetings.</p>
    <div class="empty-state">
      <div class="icon-large">✨</div>
      <p>Stay tuned! AI-driven opportunity tracking is coming soon.</p>
    </div>
  </div>
</template>

<style scoped>
.placeholder-page {
  padding: 2rem;
  text-align: left;
}

.subtitle {
  color: var(--text-secondary);
  margin-bottom: 3rem;
}

.empty-state {
  text-align: center;
  padding: 6rem 2rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 20px;
  border: 1px dashed var(--border-color);
  margin-top: 2rem;
}

.icon-large {
  font-size: 4rem;
  margin-bottom: 2rem;
  display: block;
}

.empty-state p {
  color: var(--text-secondary);
  font-size: 1.1rem;
}
</style>
