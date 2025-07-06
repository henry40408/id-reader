<template>
  <nav>
    <ul>
      <li><router-link to="/">Home</router-link></li>
      <li v-if="authenticated"><router-link to="/categories">Categories</router-link></li>
    </ul>
    <Auth />
  </nav>
</template>

<script setup lang="ts">
import { useAuth } from '../composables/useAuth';
import Auth from './Auth.vue';
const { authenticated } = useAuth();
</script>
