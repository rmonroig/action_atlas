<script setup>
import { ref } from 'vue';
import FileDrop from './FileDrop.vue';
import SummaryResult from './SummaryResult.vue';

const appState = ref('idle'); // idle, uploading, success
const summaryResult = ref(null);
const participants = ref([{ email: '', name: '', company: '' }]);
const selectedLanguage = ref('English'); // Default to English
const isAuthenticated = ref(!!localStorage.getItem('token'));

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

const handleFileSelected = async (file) => {
  appState.value = 'uploading';
  const formData = new FormData();
  formData.append('file', file);
  
  // Filter out empty participants (obligatory email)
  const validParticipants = participants.value.filter(p => p.email.trim() !== '');
  formData.append('participants', JSON.stringify(validParticipants));
  formData.append('language', selectedLanguage.value);

  try {
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('http://localhost:3000/upload', {
      method: 'POST',
      headers: headers,
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.details || errorData.error || 'Upload failed';
      throw new Error(errorMessage);
    }
    const data = await response.json();
    summaryResult.value = data;
    appState.value = 'success';
  } catch (error) {
    console.error('Frontend Error:', error);
    alert(`Error: ${error.message}`);
    appState.value = 'idle';
  }
};

const resetApp = () => {
  appState.value = 'idle';
  summaryResult.value = null;
  participants.value = [{ email: '', name: '' }];
};
</script>

<template>
  <div class="process-wrapper fade-in">
    <div class="process-container cards">
      <header>
        <h1>New Meeting Analysis</h1>
        <p class="subtitle">Upload audio and add participants for enhanced research</p>
      </header>
      
      <main class="content-grid">
        <div class="upload-section">
          <div v-if="appState === 'idle'">
             <div class="language-selector">
              <label>Processing Language:</label>
              <div class="lang-toggle">
                <button 
                  :class="{ active: selectedLanguage === 'English' }" 
                  @click="selectedLanguage = 'English'"
                  type="button"
                >
                  English
                </button>
                <button 
                  :class="{ active: selectedLanguage === 'Spanish' }" 
                  @click="selectedLanguage = 'Spanish'"
                  type="button"
                >
                  Spanish
                </button>
              </div>
            </div>
            
            <FileDrop @file-selected="handleFileSelected" />
            <div class="actions">
              <router-link :to="isAuthenticated ? '/home' : '/login'" class="back-link">
                ← {{ isAuthenticated ? 'Back to Home' : 'Back to Login' }}
              </router-link>
            </div>
          </div>
          
          <div v-else-if="appState === 'uploading'" class="loading-state">
            <div class="spinner"></div>
            <p>Analyzing Audio Waveforms & Researching Participants...</p>
          </div>
          
          <div v-else-if="appState === 'success'">
            <SummaryResult :result="summaryResult" @reset="resetApp" />
            <div class="actions">
               <router-link to="/home" class="btn btn-primary">Go to History</router-link>
            </div>
          </div>
        </div>

        <aside v-if="appState === 'idle'" class="participants-section">
          <div class="section-header">
            <h3>Meeting Participants</h3>
            <span class="badge">Research Beta</span>
          </div>
          <p class="section-hint">Emails are obligatory, names are optional.</p>
          
          <div class="participants-list">
            <div v-for="(p, index) in participants" :key="index" class="participant-row">
              <div class="input-row">
                <input 
                  type="email" 
                  v-model="p.email" 
                  placeholder="Email (Required)" 
                  class="modern-input"
                  required
                />
                <input 
                  type="text" 
                  v-model="p.name" 
                  placeholder="Name (Optional)" 
                  class="modern-input"
                />
                <input 
                  type="text" 
                  v-model="p.company" 
                  placeholder="Company (Optional)" 
                  class="modern-input"
                />
                <button @click="removeParticipant(index)" class="btn-remove" title="Remove">×</button>
              </div>
            </div>
          </div>
          
          <button @click="addParticipant" class="btn-add">
            <span class="plus-icon">+</span> Add Participant
          </button>
        </aside>
      </main>
    </div>
  </div>
</template>

<style scoped>
.process-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.process-container {
  padding: 2.5rem;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: var(--glass-border);
  border-radius: 32px;
  box-shadow: var(--shadow-soft);
}

header {
  margin-bottom: 3rem;
  text-align: center;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin-top: 0.5rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 1.5fr 0.5fr;
  gap: 3rem;
  align-items: start;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

.participants-section {
  background: rgba(255, 255, 255, 0.03);
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.section-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.badge {
  background: var(--accent-primary);
  color: white;
  font-size: 0.6rem;
  padding: 0.15rem 0.4rem;
  border-radius: 100px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
}

.section-hint {
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin-bottom: 1.5rem;
}

.participants-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
  margin-right: 2rem;
}

.input-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
}

.modern-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.6rem 0.8rem;
  border-radius: 10px;
  color: white;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.modern-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.btn-remove {
  position: absolute;
  top: 0;
  right: -32px;
  background: rgba(239, 68, 68, 0.05);
  color: #ef4444;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: #ef4444;
  color: white;
}

.btn-add {
  width: 100%;
  padding: 0.75rem;
  font-size: 0.85rem;
  background: transparent;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: var(--text-secondary);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-add:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  background: rgba(16, 185, 129, 0.05);
}

.plus-icon {
  font-size: 1.2rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(16, 185, 129, 0.1);
  border-radius: 50%;
  border-top-color: var(--accent-primary);
  animation: spin 1s linear infinite;
  margin-bottom: 2rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.actions {
  margin-top: 3rem;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.back-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.back-link:hover {
  color: var(--accent-primary);
}

.language-selector {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.language-selector label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.lang-toggle {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.lang-toggle button {
  padding: 0.5rem 1.5rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.lang-toggle button.active {
  background: var(--accent-primary);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.btn {
  padding: 0.875rem 2rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--accent-primary);
  color: white;
}

.btn-primary:hover {
  filter: brightness(1.1);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.2);
}
</style>
