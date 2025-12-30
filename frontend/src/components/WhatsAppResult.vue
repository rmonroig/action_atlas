<script setup>
import { computed } from 'vue';

const props = defineProps({
  result: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['reset']);

const parsedSummary = computed(() => {
  if (!props.result.summary) return null;
  try {
    return typeof props.result.summary === 'string' ? JSON.parse(props.result.summary) : props.result.summary;
  } catch (e) {
    return null;
  }
});

const summaryText = computed(() => {
    if (parsedSummary.value && parsedSummary.value.summary) {
        return parsedSummary.value.summary;
    }
    return props.result.summary; // Fallback to raw string if not JSON
});

const immediateActions = computed(() => {
    return parsedSummary.value?.immediateActions || [];
});

</script>

<template>
  <div class="result-card card fade-in">
    <div class="header">
      <div class="file-info">
        <span class="icon">💬</span>
        <span class="filename">{{ result.filename }}</span>
      </div>
      <span class="badge">WhatsApp Analysis</span>
    </div>
    
    <div class="main-content">
      
      <!-- Section 1: Summary -->
      <div class="section">
        <h3>Summary</h3>
        <p class="text-content">{{ summaryText }}</p>
      </div>

      <!-- Section 2: Immediate Actions -->
      <div v-if="immediateActions.length > 0" class="section">
        <h3>Immediate Actions</h3>
        <ul class="action-list">
            <li v-for="(action, index) in immediateActions" :key="index">
                {{ action }}
            </li>
        </ul>
      </div>

      <!-- Section 3: Transcript -->
      <div class="section">
        <h3>Full Transcript</h3>
        <p class="text-content transcript">{{ result.transcript }}</p>
      </div>

    </div>

    <button @click="$emit('reset')" class="reset-btn">
      Process Another Audio
    </button>
  </div>
</template>

<style scoped>
.result-card {
  text-align: left;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-secondary);
}

.filename {
  font-weight: 600;
  color: white;
}

.badge {
  background: rgba(37, 211, 102, 0.1); /* WhatsApp Green tint */
  color: #25D366;
  padding: 0.4rem 1rem;
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 700;
  border: 1px solid rgba(37, 211, 102, 0.2);
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section h3 {
  color: var(--accent-primary);
  margin-top: 0;
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.text-content {
  line-height: 1.6;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.02);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  white-space: pre-wrap;
}

.transcript {
    font-size: 0.9rem;
    max-height: 300px;
    overflow-y: auto;
    color: var(--text-secondary);
}

.action-list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.action-list li {
    background: rgba(16, 185, 129, 0.1);
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border-left: 3px solid var(--accent-primary);
    font-weight: 500;
}

.reset-btn {
  width: 100%;
  margin-top: 3rem;
  padding: 1rem;
  font-weight: 700;
  border-radius: 12px;
}
</style>
