<template>
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h4 class="text-xl font-semibold text-[#4E3B2B] mb-4">{{ title }}</h4>
      <slot></slot>
    </div>
  </template>
  
  <script setup>
  defineProps({
    title: {
      type: String,
      required: true,
    },
  })
  </script>