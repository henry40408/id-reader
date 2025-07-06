<template>
  <header>
    <Nav />
    <h1>id reader</h1>
  </header>
  <main></main>
</template>

<script setup lang="ts">
import Nav from '../components/Nav.vue';
import { useTitle } from '../composables/useTitle';

useTitle('Home');
</script>
