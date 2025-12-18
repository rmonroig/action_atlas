<script setup>
import { ref } from 'vue';

const emit = defineEmits(['file-selected']);
const isDragging = ref(false);
const fileInput = ref(null);

const handleDragEnter = (e) => {
  e.preventDefault();
  isDragging.value = true;
};

const handleDragLeave = (e) => {
  e.preventDefault();
  isDragging.value = false;
};

const handleDrop = (e) => {
  e.preventDefault();
  isDragging.value = false;
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    validateAndEmit(files[0]);
  }
};

const handleFileSelect = (e) => {
  const files = e.target.files;
  if (files.length > 0) {
    validateAndEmit(files[0]);
  }
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const validateAndEmit = (file) => {
  if (file.type === 'audio/mpeg' || file.name.endsWith('.mp3')) {
    emit('file-selected', file);
  } else {
    alert('Please upload an MP3 file.');
  }
};
</script>

<template>
  <div
    class="drop-zone"
    :class="{ 'active': isDragging }"
    @dragenter="handleDragEnter"
    @dragover.prevent
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @click="triggerFileInput"
  >
    <input
      type="file"
      ref="fileInput"
      @change="handleFileSelect"
      accept=".mp3,audio/mpeg"
      hidden
    />
    <div class="icon">
      🎵
    </div>
    <p class="instruction">
      Drag & Drop your MP3 here
      <br />
      <span class="sub-text">or click to browse</span>
    </p>
  </div>
</template>

<style scoped>
.drop-zone {
  border: 2px dashed var(--border-color);
  border-radius: 16px;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.02);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
}

.drop-zone:hover,
.drop-zone.active {
  border-color: var(--accent-primary);
  background: rgba(56, 189, 248, 0.05);
  transform: scale(1.01);
}

.icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 0 20px rgba(56, 189, 248, 0.2));
}

.instruction {
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
}

.sub-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 400;
}
</style>
