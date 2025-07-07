<template>
  <span>
    <span v-if="!confirming">
      <a href="#" @click.prevent="confirming = true"><slot /></a>
    </span>
    <span v-else>
      <span>Are you sure?</span>
      {{ ' ' }}
      <a href="#" @click.prevent="confirm()" class="text-blue-500">Yes</a>
      {{ ' ' }}
      <a href="#" @click.prevent="cancel()" class="text-red-500">No</a>
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
