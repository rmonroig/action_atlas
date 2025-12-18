<script setup>
import { ref } from 'vue';
import FileDrop from './components/FileDrop.vue';
import SummaryResult from './components/SummaryResult.vue';

const appState = ref('idle'); // idle, uploading, success
const summaryResult = ref(null);

const handleFileSelected = async (file) => {
  appState.value = 'uploading';
  
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://localhost:3000/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Upload failed');

    const data = await response.json();
    summaryResult.value = data;
    appState.value = 'success';
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while processing the file.');
    appState.value = 'idle';
  }
};

const resetApp = () => {
  appState.value = 'idle';
  summaryResult.value = null;
};
</script>

<template>
  <div class="container">
    <header>
      <h1>Action Atlas</h1>
      <p class="subtitle">AI-Powered Audio Summarization</p>
    </header>

    <main>
      <div v-if="appState === 'idle'" class="fade-in">
        <FileDrop @file-selected="handleFileSelected" />
      </div>

      <div v-else-if="appState === 'uploading'" class="loading-state fade-in">
        <div class="spinner"></div>
        <p>Analyzing Audio Waveforms...</p>
      </div>

      <div v-else-if="appState === 'success'" class="fade-in">
        <SummaryResult :result="summaryResult" @reset="resetApp" />
      </div>
    </main>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
}

header {
  margin-bottom: 3rem;
}

.subtitle {
  color: var(--accent-primary);
  font-size: 1.2rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-top: 0;
  opacity: 0.8;
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
  border: 3px solid rgba(56, 189, 248, 0.1);
  border-radius: 50%;
  border-top-color: var(--accent-primary);
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
