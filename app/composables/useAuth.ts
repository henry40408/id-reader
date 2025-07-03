import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import { ref } from 'vue';

export function useAuth() {
  const authenticated = ref<{ sub: number; username: string } | null>(null);
  const username = ref('');
  const password = ref('');

  const { onResult, onError, refetch } = useQuery<{
    currentUser: { sub: number; username: string };
  }>(gql`
    query currentUser {
      currentUser {
        sub
        username
      }
    }
  `);
  onResult((result) => {
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
    doSignIn()
      .then(() => {
        void refetch();
      })
      .catch((err) => {
        console.error('Sign in failed:', err);
      });
  }

  function signOut() {
    doSignOut()
      .then(() => {
        void refetch();
      })
      .catch((err) => {
        console.error('Sign out failed:', err);
      });
  }

  return {
    authenticated,
    username,
    password,
    signIn,
    signOut,
  };
}
