<template>
  <header>
    <Nav />
    <h1>Categories &amp; Feeds</h1>
  </header>
  <main>
    <Authenticated>
      <div>
        <a href="#" @click="creatingCategory = !creatingCategory">+ Category</a>
      </div>
      <div v-if="creatingCategory">
        <form @submit.prevent="createCategory">
          <p>
            <input v-model="categoryName" type="text" placeholder="Category Name" required />
            {{ ' ' }}
            <button type="submit">Create Category</button>
          </p>
        </form>
      </div>
      <div v-if="loading">Loading categories...</div>
      <div v-if="error">Error loading categories: {{ error.message }}</div>
      <ul v-if="result && result.getCategories">
        <li v-for="category in result.getCategories" :key="category.id">
          <div>
            <span>{{ category.name }}</span>
            {{ ' ' }}
            <Confirm @confirmed="deleteCategory(category.id)">delete</Confirm>
          </div>
          <ul>
            <li v-for="feed in category.feeds" :key="feed.id">{{ feed.title }}</li>
          </ul>
        </li>
      </ul>
    </Authenticated>
  </main>
</template>

<script setup lang="ts">
import { useMutation, useQuery } from '@vue/apollo-composable';
import Authenticated from '../components/Authenticated.vue';
import Nav from '../components/Nav.vue';
import { graphql } from '../../generated/gql/gql';
import { ref } from 'vue';
import { ApolloError } from '@apollo/client/errors';
import Confirm from '../components/Confirm.vue';
import { useAuth } from '../composables/useAuth';
import { useTitle } from '../composables/useTitle';

useTitle('Categories & Feeds');

const creatingCategory = ref(false);
const categoryName = ref('');
const error = ref<ApolloError | null>(null);

const createCategoryMutation = graphql(`
  mutation CreateCategory($name: String!) {
    createCategory(name: $name) {
      id
      name
    }
  }
`);
const { mutate: doCreateCategory } = useMutation(createCategoryMutation);

const deleteCategoryMutation = graphql(`
  mutation DeleteCategory($id: Int!) {
    deleteCategory(id: $id)
  }
`);
const { mutate: doDeleteCategory } = useMutation(deleteCategoryMutation);

async function createCategory() {
  try {
    await doCreateCategory({ name: categoryName.value });
    await refetch();
    categoryName.value = '';
  } catch (err: unknown) {
    console.error('Error creating category:', err);
    error.value = err as ApolloError;
  }
}

async function deleteCategory(id: number) {
  try {
    await doDeleteCategory({ id });
    await refetch();
  } catch (err: unknown) {
    console.error('Error deleting category:', err);
    error.value = err as ApolloError;
  }
}

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

const { authenticated } = useAuth();
const { result, loading, onError, refetch } = useQuery(getCategoriesQuery, null, () => ({
  enabled: authenticated.value,
}));
onError((err) => {
  error.value = err;
  console.error('Error fetching categories:', err);
});
</script>
