<template>
  <header>
    <Nav />
    <h1>Categories &amp; Feeds</h1>
  </header>
  <main>
    <Authenticated>
      <div v-if="loading">Loading categories...</div>
      <div v-if="error">Error loading categories: {{ error.message }}</div>
      <ul v-if="result && result.getCategories">
        <li v-for="category in result.getCategories" :key="category.id">
          <div>{{ category.name }}</div>
          <ul>
            <li v-for="feed in category.feeds" :key="feed.id">{{ feed.title }}</li>
          </ul>
        </li>
      </ul>
    </Authenticated>
  </main>
</template>

<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable';
import Authenticated from '../components/Authenticated.vue';
import Nav from '../components/Nav.vue';
import { graphql } from '../../generated/gql/gql';

const getCategoriesQuery = graphql(`
  query GetCategories {
    getCategories {
      id
      name
      feeds {
        id
        title
      }
    }
  }
`);

const { result, loading, error } = useQuery(getCategoriesQuery);
</script>
