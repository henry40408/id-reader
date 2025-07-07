<template>
  <div v-if="authenticated">
    <slot />
  </div>
  <div v-else>
    <p>Please log in to access this content.</p>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '../composables/useAuth';
const { authenticated } = useAuth();
</script>
