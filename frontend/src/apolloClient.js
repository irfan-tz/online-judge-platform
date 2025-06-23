import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

// Create HTTP link to your Django GraphQL backend
const httpLink = createHttpLink({
  uri: 'http://127.0.0.1:8000/graphql/',
});

// Create Apollo Client instance
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'ignore',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

export default client;
