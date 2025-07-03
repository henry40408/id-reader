import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import { ref } from 'vue';

export function useAuth() {
  const authenticated = ref<{ sub: number; username: string } | null>(null);
  const loading = ref(false);
  const error = ref<string>('');
  const username = ref('');
  const password = ref('');

  const { onResult, onError, refetch } = useQuery<
    | {
        currentUser: { sub: number; username: string };
      }
    | undefined
  >(gql`
    query currentUser {
      currentUser {
        sub
        username
      }
    }
  `);
  onResult((result) => {
    if (!result.data) return;
    authenticated.value = result.data.currentUser;
  });
  onError((error) => {
    console.error('Authentication error:', error);
    authenticated.value = null;
  });

  const { mutate: doSignIn } = useMutation(
    gql`
      mutation signIn($credentials: SignInInput!) {
        signIn(input: $credentials) {
          sub
          username
        }
      }
    `,
    () => ({
      variables: {
        credentials: {
          username: username.value,
          password: password.value,
        },
      },
    }),
  );

  const { mutate: doSignOut } = useMutation(
    gql`
      mutation signOut {
        signOut
      }
    `,
    () => ({}),
  );

  function signIn() {
    error.value = '';
    loading.value = true;
    doSignIn()
      .then(() => {
        void refetch();
      })
      .catch((err: Error) => {
        error.value = err.message;
        console.error('Sign in failed:', err);
      })
      .finally(() => {
        loading.value = false;
      });
  }

  function signOut() {
    loading.value = true;
    error.value = '';
    doSignOut()
      .then(() => {
        void refetch();
      })
      .catch((err: Error) => {
        error.value = err.message;
        console.error('Sign out failed:', err);
      })
      .finally(() => {
        loading.value = false;
      });
  }

  return {
    authenticated,
    error,
    loading,
    username,
    password,
    signIn,
    signOut,
  };
}
