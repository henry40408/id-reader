<template>
  <span>
    <span v-if="!confirming">
      <a href="#" @click.prevent="confirming = true"><slot /></a>
    </span>
    <span v-else>
      <span>Are you sure?</span>
      {{ ' ' }}
      <button @click="confirm()">Yes</button>
      {{ ' ' }}
      <button @click="cancel()">No</button>
    </span>
  </span>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const confirming = ref(false);
const emit = defineEmits(['confirmed', 'cancelled']);

function confirm() {
  confirming.value = false;
  emit('confirmed');
}

function cancel() {
  confirming.value = false;
  emit('cancelled');
}
</script>
