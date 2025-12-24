<script setup>
import { computed } from 'vue';
import MeetingIntelligence from './MeetingIntelligence.vue';

const props = defineProps({
  result: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['reset']);
const getCertaintyLevel = (text) => {
  if (!text) return null;
  const match = text.match(/\*\*Certainty Level\*\*:\s*(\w+)/i);
  return match ? match[1].trim() : null;
};

const formatMarkdown = (text) => {
  if (!text) return '';
  let formatted = text.toString();
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
  formatted = formatted.replace(/\n/g, '<br>');
  return formatted;
};
</script>

<template>
  <div class="summary-card card fade-in">
    <div class="header">
      <div class="file-info">
        <span class="icon">📄</span>
        <span class="filename">{{ result.filename }}</span>
      </div>
      <div class="header-actions">
        <a :href="`http://localhost:3000/export-pdf/${result.meetingId}`" class="download-btn" target="_blank">
          <span class="icon">📥</span> PDF Summary
        </a>
        <span class="badge">Analysis Complete</span>
      </div>
    </div>
    
    <div class="main-content">
      <div class="summary-section">
        <h3>Meeting Intelligence</h3>
        <MeetingIntelligence :summary="result.summary" />
      </div>

      <div v-if="result.participants && result.participants.length > 0" class="participants-section">
        <h3>Participant Intelligence</h3>
        <div class="participants-grid">
          <div v-for="(p, index) in result.participants" :key="index" class="participant-info-card">
            <div class="participant-header">
              <span class="avatar">👤</span>
              <div class="name-box">
                <div class="name-row">
                  <span class="p-name">{{ p.name || 'Unknown Participant' }}</span>
                  <span v-if="p.company" class="p-company">@ {{ p.company }}</span>
                  <span v-if="getCertaintyLevel(p.researchData)" 
                        :class="['c-badge', getCertaintyLevel(p.researchData).toLowerCase()]">
                    {{ getCertaintyLevel(p.researchData) }}
                  </span>
                </div>
                <span class="p-email">{{ p.email }}</span>
              </div>
            </div>
            <div class="research-data">
              <div class="data-text" v-if="p.researchData" v-html="formatMarkdown(p.researchData)">
              </div>
              <div class="data-pending" v-else>
                Research information not available.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button @click="$emit('reset')" class="reset-btn">
      Summarize Another Meeting
    </button>
  </div>
</template>

<style scoped>
.summary-card {
  text-align: left;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  border-radius: 20px;
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(16, 185, 129, 0.08);
  color: var(--accent-primary);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.4rem 1rem;
  border-radius: 100px;
  border: 1px solid rgba(16, 185, 129, 0.2);
  transition: all 0.2s;
}

.download-btn:hover {
  background: var(--accent-primary);
  color: white;
  transform: translateY(-1px);
}

.badge {
  background: rgba(16, 185, 129, 0.1);
  color: var(--accent-primary);
  padding: 0.4rem 1rem;
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 700;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

h3 {
  color: var(--accent-primary);
  margin-top: 0;
  margin-bottom: 1.25rem;
  font-size: 1.25rem;
  font-weight: 700;
}

.summary-text {
  white-space: pre-wrap;
  line-height: 1.7;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.02);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}


/* Participant Styles */
.participants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .participants-grid {
    grid-template-columns: 1fr;
  }
}

.participant-info-card {
  background: rgba(255, 255, 255, 0.03);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.participant-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.avatar {
  font-size: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.name-box {
  display: flex;
  flex-direction: column;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.p-name {
  font-weight: 700;
  font-size: 1rem;
}

.p-company {
  font-size: 0.85rem;
  color: var(--accent-primary);
  opacity: 0.8;
  font-weight: 500;
}

.c-badge {
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-weight: 700;
  text-transform: uppercase;
}

.c-badge.high {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.c-badge.medium {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.c-badge.low {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.p-email {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.research-data {
  font-size: 0.9rem;
  line-height: 1.6;
  white-space: pre-wrap;
  color: var(--text-primary);
}

.reset-btn {
  width: 100%;
  margin-top: 3rem;
  padding: 1rem;
  font-weight: 700;
  border-radius: 12px;
}
</style>
