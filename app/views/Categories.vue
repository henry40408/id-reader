<template>
  <header>
    <Nav />
    <h1>Categories</h1>
  </header>
  <main>
    <Authenticated></Authenticated>
  </main>
</template>

<script setup lang="ts">
import Authenticated from '../components/Authenticated.vue';
import Nav from '../components/Nav.vue';
</script>
