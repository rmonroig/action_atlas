<script setup>
import { ref, computed, watch } from 'vue';
import MeetingIntelligence from './MeetingIntelligence.vue';
import { API_URL } from '../config';

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
});

const showDetails = ref(false);
const showTranscript = ref(false);
const activeTab = ref('outcomes'); 

// Determine available content
const hasBrief = computed(() => !!props.item.brief);
const hasSummary = computed(() => !!props.item.summary);
const hasBoth = computed(() => hasBrief.value && hasSummary.value);
const isWhatsApp = computed(() => props.item.type === 'whatsapp');

// Auto-select tab logic
watch(() => props.item, () => {
    if (hasSummary.value) activeTab.value = 'outcomes';
    else if (hasBrief.value) activeTab.value = 'preparation';
}, { immediate: true });

const structuredSummary = computed(() => {
  if (!props.item.summary) return null;
  try {
    const parsed = typeof props.item.summary === 'string' ? JSON.parse(props.item.summary) : props.item.summary;
    // Standard Meeting
    if (parsed.outcomes || parsed.actionItems || parsed.decisions) {
      return parsed;
    }
    // WhatsApp
    if (parsed.summary && parsed.immediateActions) {
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
        <span class="icon" v-if="isWhatsApp" style="color: #25D366">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
        </span>
        <span class="icon" v-else>📄</span>
        
        <div class="title-meta">
          <span class="filename">{{ item.filename }}</span>
          <span class="date">{{ formatDate(item.timestamp) }}</span>
        </div>
      </div>
      <div class="indicators">
         <span v-if="structuredSummary?.actionItems?.length" class="badge-count">
            ⚡ {{ structuredSummary.actionItems.length }}
         </span>
         <span v-if="structuredSummary?.immediateActions?.length" class="badge-count">
            ⚡ {{ structuredSummary.immediateActions.length }}
         </span>
         <span class="chevron" :class="{ 'rotated': showDetails }">▼</span>
      </div>
    </div>
    
    <div v-if="showDetails" class="content-expanded fade-in">
      
      <!-- Tabs (Only relevant for Meetings that have Preps, WA doesn't have Prep yet) -->
      <div v-if="hasBoth" class="tabs">
        <button 
            :class="['tab-btn', { active: activeTab === 'preparation' }]"
            @click="activeTab = 'preparation'"
        >
            Preparation
        </button>
        <button 
            :class="['tab-btn', { active: activeTab === 'outcomes' }]"
            @click="activeTab = 'outcomes'"
        >
            Outcomes & Recording
        </button>
      </div>

      <!-- Preparation View -->
      <div v-if="activeTab === 'preparation' && hasBrief" class="tab-content fade-in">
        <div class="brief-section">
            <h4 class="section-title">Meeting Brief: {{ item.topic }}</h4>
            <p class="brief-summary">{{ item.brief.brief }}</p>
            
            <div class="brief-grid">
                <div class="brief-card">
                    <h5>Talking Points</h5>
                    <ul><li v-for="(p, i) in item.brief.talkingPoints" :key="i">{{ p }}</li></ul>
                </div>
                <div class="brief-card">
                    <h5>Key Questions</h5>
                    <ul><li v-for="(q, i) in item.brief.questions" :key="i">{{ q }}</li></ul>
                </div>
            </div>
        </div>
      </div>

      <!-- Outcomes View -->
      <div v-if="activeTab === 'outcomes' && hasSummary" class="tab-content fade-in">
        <div class="summary-section">
            <!-- Custom WA Display -->
            <div v-if="isWhatsApp && structuredSummary" class="wa-result">
                <h3>WhatsApp Audio Summary</h3>
                <p class="wa-summary-text">{{ structuredSummary.summary }}</p>
                <div class="wa-actions">
                    <h4>Immediate Actions</h4>
                    <ul>
                        <li v-for="(action, i) in structuredSummary.immediateActions" :key="i">
                            {{ action }}
                        </li>
                    </ul>
                </div>
            </div>
            <!-- Standard Meeting Display -->
            <MeetingIntelligence v-else :summary="item.summary" />
        </div>

        <div class="actions-row">
            <a v-if="!isWhatsApp" :href="`${API_URL}/export-pdf/${item.meetingId}`" class="secondary-btn download-btn" target="_blank">
            📥 Download PDF
            </a>
            <button @click="showTranscript = !showTranscript" class="secondary-btn">
            {{ showTranscript ? 'Hide Transcript' : 'View Transcript' }}
            </button>
        </div>
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

.tabs {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 0px;
}

.tab-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    padding: 0.5rem 1rem;
    font-size: 0.95rem;
    cursor: pointer;
    font-weight: 600;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
}

.tab-btn:hover {
    color: white;
}

.tab-btn.active {
    color: var(--accent-primary);
    border-bottom-color: var(--accent-primary);
}

.brief-section {
    padding-top: 1rem;
}

.section-title {
    color: var(--text-primary);
    margin-top: 0;
    font-size: 1.1rem;
}

.brief-summary {
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 2rem;
    background: rgba(255,255,255,0.02);
    padding: 1rem;
    border-radius: 8px;
}

.brief-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.brief-card {
    background: rgba(255, 255, 255, 0.03);
    padding: 1.25rem;
    border-radius: 12px;
}

.brief-card h5 {
    margin-top: 0;
    color: var(--accent-primary);
    text-transform: uppercase;
    font-size: 0.85rem;
    margin-bottom: 0.75rem;
}

.brief-card ul {
    margin: 0;
    padding-left: 1.2rem;
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.brief-card li {
    margin-bottom: 0.4rem;
}

.wa-result {
    text-align: left;
}

.wa-result h3 {
    margin-top: 0;
    color: #25D366;
    font-size: 1.1rem;
}

.wa-summary-text {
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
}

.wa-actions {
    background: rgba(37, 211, 102, 0.1);
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid rgba(37, 211, 102, 0.2);
}

.wa-actions h4 {
    margin-top: 0;
    color: #25D366;
    font-size: 0.9rem;
    text-transform: uppercase;
    margin-bottom: 1rem;
}

.wa-actions ul {
    margin: 0;
    padding-left: 1.2rem;
}

.wa-actions li {
    margin-bottom: 0.5rem;
}
</style>
