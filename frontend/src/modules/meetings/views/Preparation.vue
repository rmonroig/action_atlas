<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { API_URL } from '../../../config';
import { marked } from 'marked'; // Assuming marked is available as it was used elsewhere, or I will use a simple fallback.

const formatMarkdown = (text) => {
    if (!text) return '';
    try {
        return marked.parse(text);
    } catch (e) {
        return text.replace(/\n/g, '<br>');
    }
};

const router = useRouter();
const topic = ref('');
const participants = ref([{ email: '', name: '', company: '' }]);
const appState = ref('idle'); // idle, processing, success
const brief = ref(null);
const meetingId = ref(null); // Store returned ID

const addParticipant = () => {
  participants.value.push({ email: '', name: '', company: '' });
};

const removeParticipant = (index) => {
  if (participants.value.length > 1) {
    participants.value.splice(index, 1);
  } else {
    participants.value[0] = { email: '', name: '', company: '' };
  }
};

const navigateToUpload = () => {
  if (meetingId.value) {
    router.push({ path: '/process', query: { id: meetingId.value } });
  }
};

const generateBrief = async () => {
  if (!topic.value) return alert('Please enter a meeting topic.');
  
  const validParticipants = participants.value.filter(p => p.name || p.email);
  if (validParticipants.length === 0) return alert('Please add at least one participant.');

  appState.value = 'processing';

  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/prepare`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        topic: topic.value,
        participants: validParticipants
      }),
    });

    if (!response.ok) throw new Error('Failed to generate brief');

    const data = await response.json();
    brief.value = data;
    meetingId.value = data.meetingId;
    appState.value = 'success';

  } catch (error) {
    console.error(error);
    alert('Error generating brief');
    appState.value = 'idle';
  }
};

const reset = () => {
  appState.value = 'idle';
  brief.value = null;
  meetingId.value = null;
  topic.value = '';
  participants.value = [{ email: '', name: '', company: '' }];
};
</script>

<template>
  <div class="prep-wrapper fade-in">
    <div class="prep-container cards">
      <header>
        <h1>Meeting Preparation</h1>
        <p class="subtitle">Research participants and generate a winning strategy</p>
      </header>

      <main class="content-grid" v-if="appState === 'idle'">
        <!-- Left: Input Form -->
        <div class="input-section">
          <div class="form-group">
            <label>Meeting Topic / Context</label>
            <input 
              v-model="topic" 
              type="text" 
              placeholder="e.g., Q3 Sales Pitch to Acme Corp" 
              class="modern-input large"
            />
          </div>

          <div class="participants-section">
            <div class="section-header">
              <h3>Participants to Research</h3>
            </div>
            
            <div class="participants-list">
              <div v-for="(p, index) in participants" :key="index" class="participant-row">
                <div class="input-row">
                  <input 
                    type="text" 
                    v-model="p.name" 
                    placeholder="Name" 
                    class="modern-input"
                  />
                  <input 
                    type="text" 
                    v-model="p.company" 
                    placeholder="Company" 
                    class="modern-input"
                  />
                  <input 
                    type="email" 
                    v-model="p.email" 
                    placeholder="Email (Optional)" 
                    class="modern-input"
                  />
                  <button @click="removeParticipant(index)" class="btn-remove" title="Remove">×</button>
                </div>
              </div>
            </div>
            
            <button @click="addParticipant" class="btn-add">
              <span class="plus-icon">+</span> Add Participant
            </button>
          </div>

          <div class="actions">
            <button @click="generateBrief" class="btn btn-primary">Generate Briefing</button>
          </div>
        </div>
      </main>

      <div v-else-if="appState === 'processing'" class="loading-state">
        <div class="spinner"></div>
        <p>Researching participants and formulating strategy...</p>
      </div>

      <div v-else-if="appState === 'success'" class="result-view">
        <div class="brief-header">
          <div class="header-left">
            <h2>Brief: {{ topic }}</h2>
          </div>
          <div class="header-actions">
            <button @click="navigateToUpload" class="btn btn-primary small">
              Upload Meeting Audio ->
            </button>
            <button @click="reset" class="btn-text">Start Over</button>
          </div>
        </div>

        <!-- NEW: Participant Intelligence Dropdown -->
        <div class="brief-card full-width" v-if="brief.researchResults && brief.researchResults.length > 0">
           <h3>Participant Intelligence</h3>
           <div class="research-accordion">
              <details v-for="(p, index) in brief.researchResults" :key="index" class="participant-details">
                 <summary>
                    <span class="p-summary-name">{{ p.name }}</span>
                    <span v-if="p.company" class="p-summary-company">@ {{ p.company }}</span>
                    <span class="dropdown-icon">▼</span>
                 </summary>
                 <div class="p-content">
                    <div class="p-meta">
                       <strong>Email:</strong> {{ p.email }}
                    </div>
                    <div class="p-research-data" v-html="formatMarkdown(p.data)"></div>
                 </div>
              </details>
           </div>
        </div>

        <div class="brief-card">
          <h3>Executive Summary</h3>
          <p>{{ brief.brief }}</p>
        </div>

        <div class="brief-grid">
          <div class="brief-card">
            <h3>Strategic Talking Points</h3>
            <ul>
              <li v-for="(point, i) in brief.talkingPoints" :key="i">{{ point }}</li>
            </ul>
          </div>
          
          <div class="brief-card">
            <h3>Key Questions</h3>
            <ul>
              <li v-for="(q, i) in brief.questions" :key="i">{{ q }}</li>
            </ul>
          </div>

          <div class="brief-card full-width">
            <h3>Icebreakers</h3>
            <ul>
              <li v-for="(ice, i) in brief.icebreakers" :key="i">{{ ice }}</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.prep-wrapper {
  max-width: 1000px;
  margin: 0 auto;
}

.prep-container {
  padding: 2.5rem;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: var(--glass-border);
  border-radius: 32px;
  box-shadow: var(--shadow-soft);
}

header {
  margin-bottom: 2rem;
  text-align: center;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin-top: 0.5rem;
}

.form-group {
  margin-bottom: 2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.9rem;
}

.modern-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.8rem;
  border-radius: 12px;
  color: white;
  transition: all 0.2s;
}

.modern-input.large {
  font-size: 1.1rem;
  padding: 1rem;
}

.modern-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: rgba(255, 255, 255, 0.08);
}

.participants-section {
  background: rgba(255, 255, 255, 0.03);
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 2rem;
}

.section-header h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
}

.participants-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.input-row {
  display: flex;
  gap: 0.5rem;
  position: relative;
  align-items: center;
}

.btn-remove {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.btn-remove:hover {
  background: rgba(239, 68, 68, 0.2);
}

.btn-add {
  width: 100%;
  padding: 0.8rem;
  background: transparent;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-add:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  background: rgba(16, 185, 129, 0.05);
}

.actions {
  display: flex;
  justify-content: center;
}

.btn-primary {
  background: var(--accent-primary);
  color: white;
  padding: 1rem 3rem;
  border-radius: 12px;
  font-weight: 600;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.2);
}

.loading-state {
  text-align: center;
  padding: 4rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(16, 185, 129, 0.1);
  border-radius: 50%;
  border-top-color: var(--accent-primary);
  animation: spin 1s linear infinite;
  margin: 0 auto 2rem auto;
}

@keyframes spin { to { transform: rotate(360deg); } }

.result-view {
  animation: fadeIn 0.5s ease;
}

.brief-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.brief-header h2 {
  margin: 0;
  color: var(--accent-primary);
}

.btn-text {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  text-decoration: underline;
}

.brief-card {
  background: rgba(255, 255, 255, 0.03);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 1.5rem;
}

.brief-card h3 {
  margin-top: 0;
  color: var(--accent-primary);
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.brief-card p {
  line-height: 1.6;
  color: var(--text-primary);
}

.brief-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.full-width {
  grid-column: span 2;
}

ul {
  padding-left: 1.2rem;
  margin: 0;
}

li {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .brief-grid {
    grid-template-columns: 1fr;
  }
  .full-width {
    grid-column: span 1;
  }
  .btn-remove {
    position: relative;
    width: 100%;
    margin-top: 0.5rem;
  }
}

/* Accordion Styles */
.research-accordion {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.participant-details {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.participant-details summary {
  padding: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-weight: 600;
  list-style: none; /* Hide default triangle */
  position: relative;
}

.participant-details summary::-webkit-details-marker {
  display: none;
}

.p-summary-name {
  color: white;
  margin-right: 0.5rem;
}

.p-summary-company {
  color: var(--text-secondary);
  font-weight: 400;
  font-size: 0.9rem;
}

.dropdown-icon {
  margin-left: auto;
  color: var(--text-secondary);
  font-size: 0.8rem;
  transition: transform 0.2s;
}

.participant-details[open] .dropdown-icon {
  transform: rotate(180deg);
}

.p-content {
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.95rem;
  line-height: 1.6;
}

.p-meta {
  margin-bottom: 1rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.p-research-data :deep(h1), .p-research-data :deep(h2), .p-research-data :deep(h3) {
  margin-top: 0;
  font-size: 1rem;
  color: var(--accent-primary);
}

.p-research-data :deep(strong) {
  color: white;
}
</style>
