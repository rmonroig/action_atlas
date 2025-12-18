<script setup>
defineProps({
  result: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['reset']);
</script>

<template>
  <div class="summary-card card fade-in">
    <div class="header">
      <div class="file-info">
        <span class="icon">📄</span>
        <span class="filename">{{ result.filename }}</span>
      </div>
      <span class="badge">Success</span>
    </div>
    
    <div class="content">
      <h3>Audio Summary</h3>
      <div class="summary-text">
        {{ result.summary }}
      </div>
    </div>

    <button @click="$emit('reset')" class="reset-btn">
      Summarize Another
    </button>
  </div>
</template>

<style scoped>
.summary-card {
  text-align: left;
  max-width: 600px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
}

.badge {
  background: rgba(74, 222, 128, 0.1);
  color: var(--success);
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid rgba(74, 222, 128, 0.2);
}

.content h3 {
  color: var(--accent-primary);
  margin-top: 0;
  margin-bottom: 1rem;
}

.summary-text {
  white-space: pre-wrap;
  line-height: 1.7;
  color: var(--text-primary);
}

.reset-btn {
  width: 100%;
  margin-top: 2rem;
  background: var(--bg-primary);
}
</style>
