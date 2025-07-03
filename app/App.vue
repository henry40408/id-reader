<template>
  <h1>id reader</h1>
  <div v-if="authenticated">
    <div>Welcome back, {{ authenticated.username }}!</div>
    <div><a href="#" @click.prevent="signOut()">sign out</a></div>
  </div>
  <form @submit.prevent="signIn()" v-else>
    <input type="text" placeholder="username" v-model="username" />
    <input type="password" placeholder="password" v-model="password" />
    <button type="submit" :disabled="loading">Submit</button>
  </form>
  <div v-if="error">{{ error }}</div>
</template>

<script setup lang="ts">
import { useAuth } from './composables/useAuth';

const { authenticated, error, loading, username, password, signIn, signOut } = useAuth();
</script>
