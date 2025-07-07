<template>
  <header>
    <Nav />
    <h1>Unread Entries</h1>
  </header>
  <main>
    <template v-if="loading">
      <p>Loading...</p>
    </template>
    <template v-else-if="error">
      <p>Error: {{ error.message }}</p>
    </template>
    <template v-else>
      <div v-if="result" v-for="entry in result.getUnreadEntries" :key="entry.id" class="mb-4">
        <h3>
          {{ spacing(entry.title) }}
          {{ ' ' }}
          <a v-if="entry.link" :href="entry.link" target="_blank" rel="noopener noreferrer">Read more</a>
        </h3>
        <div>
          <span>{{ spacing(entry.feed.title) }},</span>
          {{ ' ' }}
          <span>{{ new Date(entry.isoDate) }}</span>
        </div>
      </div>
    </template>
  </main>
</template>

<script setup lang="ts">
import { useTitle } from '../composables/useTitle';
import Nav from '../components/Nav.vue';
import { graphql } from '../../generated/gql';
import { useQuery } from '@vue/apollo-composable';
import { spacing } from '../helper';

useTitle('Unread Entries');

const getUnreadEntriesQuery = graphql(`
  query GetUnreadEntries {
    getUnreadEntries {
      id
      title
      link
      isoDate
      readAt
      feed {
        id
        title
      }
    }
  }
`);
const { result, loading, error } = useQuery(getUnreadEntriesQuery);
</script>
