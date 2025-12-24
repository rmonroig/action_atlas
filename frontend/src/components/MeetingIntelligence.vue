<script setup>
import { computed } from 'vue';

const props = defineProps({
  summary: {
    type: [Object, String],
    required: true
  }
});

const data = computed(() => {
  if (typeof props.summary === 'object') return props.summary;
  try {
    return JSON.parse(props.summary);
  } catch (e) {
    return null;
  }
});

const formatMarkdown = (text) => {
  if (!text) return '';
  let formatted = text.toString();
  
  // Bold: **text**
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Italics: *text*
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Headings: ### text -> <h5>text</h5> (using smaller tags for card fitting)
  formatted = formatted.replace(/^#### (.*$)/gm, '<h6 class="md-h">$1</h6>');
  formatted = formatted.replace(/^### (.*$)/gm, '<h5 class="md-h">$1</h5>');
  formatted = formatted.replace(/^## (.*$)/gm, '<h4 class="md-h">$1</h4>');
  
  // Line breaks
  formatted = formatted.replace(/\n/g, '<br>');
  
  return formatted;
};
</script>

<template>
  <div v-if="data" class="intel-dashboard">
    <!-- Top Row: Outcomes & Decisions -->
    <div class="intel-row two-col">
      <div v-if="data.outcomes?.length" class="intel-card">
        <h4 class="card-title"><span class="icon">🎯</span> Key Outcomes</h4>
        <ul class="intel-list">
          <li v-for="(item, i) in data.outcomes" :key="i" v-html="formatMarkdown(item)"></li>
        </ul>
      </div>

      <div v-if="data.decisions?.length" class="intel-card">
        <h4 class="card-title"><span class="icon">✅</span> Decisions</h4>
        <ul class="intel-list">
          <li v-for="(item, i) in data.decisions" :key="i" v-html="formatMarkdown(item)"></li>
        </ul>
      </div>
    </div>

    <!-- Action Items (Full Width) -->
    <div v-if="data.actionItems?.length" class="intel-card action-section">
      <h4 class="card-title"><span class="icon">⚡</span> Action Items</h4>
      <div class="action-grid">
        <div v-for="(item, i) in data.actionItems" :key="i" class="action-item-card">
          <p class="a-task" v-html="formatMarkdown(item.task)"></p>
          <div class="a-meta">
            <span class="a-badge owner" v-if="item.owner">👤 {{ item.owner }}</span>
            <span class="a-badge deadline" v-if="item.deadline">📅 {{ item.deadline }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Row: Risks & Next Steps -->
    <div class="intel-row two-col">
      <div v-if="data.risks?.length" class="intel-card warning-card">
        <h4 class="card-title"><span class="icon">⚠️</span> Risks / Open Questions</h4>
        <ul class="intel-list">
          <li v-for="(item, i) in data.risks" :key="i" v-html="formatMarkdown(item)"></li>
        </ul>
      </div>

      <div v-if="data.nextSteps?.length" class="intel-card highlight-card">
        <h4 class="card-title"><span class="icon">🚀</span> Next Steps</h4>
        <ul class="intel-list">
          <li v-for="(item, i) in data.nextSteps" :key="i" v-html="formatMarkdown(item)"></li>
        </ul>
      </div>
    </div>
  </div>
  
  <!-- Fallback for plain text -->
  <div v-else class="legacy-summary" v-html="formatMarkdown(summary)">
  </div>
</template>

<style scoped>
.md-h {
  margin: 1rem 0 0.5rem 0;
  color: white;
  font-weight: 700;
}

h4.md-h { font-size: 1.05rem; }
h5.md-h { font-size: 0.95rem; }
h6.md-h { font-size: 0.85rem; text-transform: uppercase; opacity: 0.8; }
.intel-dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.intel-row {
  display: flex;
  gap: 1.5rem;
}

.intel-row.two-col > * {
  flex: 1;
  min-width: 0;
}

@media (max-width: 768px) {
  .intel-row.two-col {
    flex-direction: column;
  }
}

.intel-card {
  background: rgba(255, 255, 255, 0.03);
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  text-align: left;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 1.25rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
  letter-spacing: -0.01em;
}

.intel-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.intel-list li {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-primary);
  padding-left: 1.25rem;
  position: relative;
}

.intel-list li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--accent-primary);
  font-weight: bold;
}

.warning-card .intel-list li::before {
  color: var(--error);
}

.highlight-card .intel-list li::before {
  color: var(--accent-secondary);
}

/* Action Items Grid */
.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.action-item-card {
  background: rgba(255, 255, 255, 0.04);
  padding: 1.25rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.2s ease;
}

.action-item-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(16, 185, 129, 0.3);
}

.a-task {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.4;
  color: white;
}

.a-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.a-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.6rem;
  border-radius: 100px;
  font-weight: 600;
}

.a-badge.owner {
  background: rgba(16, 185, 129, 0.1);
  color: var(--accent-primary);
}

.a-badge.deadline {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
}

.legacy-summary {
  white-space: pre-wrap;
  line-height: 1.7;
  color: var(--text-primary);
  text-align: left;
}
</style>
