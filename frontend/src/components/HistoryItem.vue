<script setup>
import { ref, computed } from 'vue';
import MeetingIntelligence from './MeetingIntelligence.vue';

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
});

const showDetails = ref(false);
const showTranscript = ref(false);

const structuredSummary = computed(() => {
  if (!props.item.summary) return null;
  try {
    const parsed = typeof props.item.summary === 'string' ? JSON.parse(props.item.summary) : props.item.summary;
    if (parsed.outcomes || parsed.actionItems || parsed.decisions) {
      return parsed;
    }
  } catch (e) {}
  return null;
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};
</script>

<template>
  <div class="history-item card fade-in">
    <div class="header" @click="showDetails = !showDetails">
      <div class="file-info">
        <span class="icon">📄</span>
        <div class="title-meta">
          <span class="filename">{{ item.filename }}</span>
          <span class="date">{{ formatDate(item.timestamp) }}</span>
        </div>
      </div>
      <div class="indicators">
         <span v-if="structuredSummary?.actionItems?.length" class="badge-count">
            ⚡ {{ structuredSummary.actionItems.length }}
         </span>
         <span class="chevron" :class="{ 'rotated': showDetails }">▼</span>
      </div>
    </div>
    
    <div v-if="showDetails" class="content-expanded fade-in">
      <div class="summary-section">
        <MeetingIntelligence :summary="item.summary" />
      </div>

      <div class="actions-row">
        <a :href="`http://localhost:3000/export-pdf/${item.meetingId}`" class="secondary-btn download-btn" target="_blank">
          📥 Download PDF
        </a>
        <button @click="showTranscript = !showTranscript" class="secondary-btn">
          {{ showTranscript ? 'Hide Transcript' : 'View Transcript' }}
        </button>
      </div>

      <div v-if="showTranscript" class="transcript-section fade-in">
        <h4>Full Transcript</h4>
        <p class="transcript-text">{{ item.transcript }}</p>
      </div>
    </div>
    
    <!-- Collapsed Preview -->
    <div v-else class="content-preview" @click="showDetails = true">
      <div v-if="structuredSummary" class="preview-line">
         <span v-if="structuredSummary.outcomes?.length" class="outcomes-prev">
            🎯 {{ structuredSummary.outcomes[0] }}
         </span>
         <span v-if="structuredSummary.outcomes?.length > 1" class="more-tag">+{{ structuredSummary.outcomes.length - 1 }}</span>
      </div>
      <p v-else class="summary-preview-text">{{ item.summary }}</p>
    </div>
  </div>
</template>

<style scoped>
.history-item {
  margin-bottom: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  overflow: hidden;
  cursor: pointer;
}

.history-item:hover {
  border-color: rgba(16, 185, 129, 0.3);
  background: rgba(255, 255, 255, 0.02);
}

.header {
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: left;
}

.filename {
  font-weight: 700;
  color: white;
  font-size: 1.05rem;
}

.date {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.indicators {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.badge-count {
  background: rgba(16, 185, 129, 0.1);
  color: var(--accent-primary);
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
}

.chevron {
  font-size: 0.7rem;
  opacity: 0.5;
  transition: transform 0.3s;
}

.chevron.rotated {
  transform: rotate(180deg);
}

.content-preview {
  padding: 0 1.5rem 1.25rem 1.5rem;
  text-align: left;
}

.preview-line {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.outcomes-prev {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 400px;
}

.more-tag {
  background: rgba(255, 255, 255, 0.05);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.summary-preview-text {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.content-expanded {
  padding: 0 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
  background: rgba(0, 0, 0, 0.1);
}

.summary-section {
  padding-top: 1.5rem;
}

.actions-row {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-start;
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.6rem 1.2rem;
  font-size: 0.85rem;
  border-radius: 8px;
  color: var(--text-primary);
  text-decoration: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: all 0.2s;
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.download-btn {
  background: rgba(16, 185, 129, 0.1);
  color: var(--accent-primary);
  border-color: rgba(16, 185, 129, 0.2);
  gap: 0.5rem;
}

.download-btn:hover {
  background: var(--accent-primary);
  color: white;
}

.transcript-section {
  margin-top: 2rem;
  text-align: left;
  background: rgba(255, 255, 255, 0.02);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.transcript-section h4 {
  margin-top: 0;
  color: var(--accent-primary);
  font-size: 0.9rem;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.transcript-text {
  white-space: pre-wrap;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text-secondary);
}
</style>
