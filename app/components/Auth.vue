<template>
  <div v-if="authenticated">
    <div>
      Welcome back, <strong>{{ jwtPayload?.username }}</strong
      >!
    </div>
    <div><a href="#" @click.prevent="signOut()">sign out</a></div>
  </div>
  <form @submit.prevent="signIn()" v-else>
    <input type="text" placeholder="username" v-model="username" />
    <input type="password" placeholder="password" v-model="password" />
    <button type="submit" :disabled="loading">sign in</button>
  </form>
  <div v-if="error">{{ error }}</div>
</template>

<script setup lang="ts">
import { useAuth } from '../composables/useAuth';

const { authenticated, error, jwtPayload, loading, username, password, signIn, signOut } = useAuth();
</script>
