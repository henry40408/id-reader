import { useMutation, useQuery } from '@vue/apollo-composable';
import { ref } from 'vue';
import { graphql } from '../../generated/gql';

const currentUserQuery = graphql(`
  query CurrentUser {
    currentUser {
      sub
      username
    }
  }
`);

const signInMutation = graphql(`
  mutation signIn($credentials: SignInInput!) {
    signIn(input: $credentials) {
      sub
      username
    }
  }
`);

const signOutMutation = graphql(`
  mutation signOut {
    signOut
  }
`);

const authenticated = ref(false);
const jwtPayload = ref<{ sub: number; username: string } | null>(null);
const loading = ref(false);
const error = ref<string>('');
const username = ref('');
const password = ref('');

export function useAuth() {
  const { onError, onResult, refetch } = useQuery(currentUserQuery, null, { fetchPolicy: 'no-cache' });
  onResult((result) => {
    if (result.data?.currentUser) {
      authenticated.value = true;
      jwtPayload.value = result.data.currentUser;
    } else {
      authenticated.value = false;
      jwtPayload.value = null;
    }
  });
  onError((err: Error) => {
    console.error('Error fetching current user:', err);
    authenticated.value = false;
    jwtPayload.value = null;
  });

  const { mutate: doSignIn } = useMutation(signInMutation, () => ({
    variables: {
      credentials: {
        username: username.value,
        password: password.value,
      },
    },
  }));

  const { mutate: doSignOut } = useMutation(signOutMutation, () => ({}));

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
    jwtPayload,
    error,
    loading,
    username,
    password,
    signIn,
    signOut,
  };
}
