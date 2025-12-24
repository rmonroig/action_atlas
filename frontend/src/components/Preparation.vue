<template>
  <div class="placeholder-page fade-in">
    <h1>Meeting Preparation</h1>
    <p class="subtitle">Get ready for your upcoming meetings with automated briefs and key insights.</p>
    <div class="empty-state">
      <div class="icon-large">📝</div>
      <p>Automated meeting briefs and preparation tools will be available here.</p>
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
