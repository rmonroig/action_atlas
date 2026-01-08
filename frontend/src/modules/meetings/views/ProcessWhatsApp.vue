<script setup>
import { ref, onMounted } from 'vue';
import FileDrop from '../../../components/ui/FileDrop.vue';
import WhatsAppResult from '../components/WhatsAppResult.vue';
import { API_URL } from '../../../config';

const appState = ref('idle'); // idle, uploading, success
const resultData = ref(null);
const selectedLanguage = ref('English'); // Default to English
const isAuthenticated = ref(!!localStorage.getItem('token'));

const handleFileSelected = async (file) => {
  appState.value = 'uploading';
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', selectedLanguage.value);

  try {
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/upload-whatsapp`, {
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
    resultData.value = data;
    appState.value = 'success';
  } catch (error) {
    console.error('Frontend Error:', error);
    alert(`Error: ${error.message}`);
    appState.value = 'idle';
  }
};

const resetApp = () => {
  appState.value = 'idle';
  resultData.value = null;
};

// Check for shared files from PWA Share Target
const checkSharedFiles = async () => {
  if (!('indexedDB' in window)) return;

  const dbRequest = indexedDB.open('share-target-db', 1);
  
  dbRequest.onsuccess = (e) => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains('shared-files')) return;

    const tx = db.transaction('shared-files', 'readwrite');
    const store = tx.objectStore('shared-files');
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = () => {
      const items = getAllRequest.result;
      if (items && items.length > 0) {
        // Take the last shared file
        const lastItem = items[items.length - 1];
        console.log('Found shared file:', lastItem.file.name);
        
        // Auto-select the file
        handleFileSelected(lastItem.file);

        // cleanup
        store.clear();
      }
    };
  };
};

onMounted(() => {
  checkSharedFiles();
});
</script>

<template>
  <div class="process-wrapper fade-in">
    <div class="process-container cards">
      <header>
        <h1>WhatsApp Audio Analysis</h1>
        <p class="subtitle">Quickly summarize audio notes into immediate actions</p>
      </header>
      
      <main class="content-grid-single">
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
                ← Back
              </router-link>
            </div>
          </div>
          
          <div v-else-if="appState === 'uploading'" class="loading-state">
            <div class="spinner"></div>
            <p>Transcribing and extracting actions...</p>
          </div>
          
          <div v-else-if="appState === 'success'">
            <WhatsAppResult :result="resultData" @reset="resetApp" />
            <div class="actions">
               <router-link to="/home" class="btn btn-primary">Go to History</router-link>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.process-wrapper {
  max-width: 800px;
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

.content-grid-single {
  display: flex;
  justify-content: center;
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
