<template>
  <div>
    <slot v-if="!hasError"></slot>
    <div v-else class="error">
      <h2>An error occurred</h2>
      <pre>{{ error }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, ref, onErrorCaptured } from 'vue';

const hasError = ref(false);
const error = ref('');

onErrorCaptured((err) => {
  hasError.value = true;
  error.value = err.message || 'Unknown error';
  console.error(err);
  return false; // Prevent further propagation
});
</script>

<style scoped>
.error {
  color: red;
  padding: 20px;
  background-color: #ffe6e6;
  border: 1px solid red;
  border-radius: 5px;
}
</style>
