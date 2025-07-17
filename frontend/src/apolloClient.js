import { ApolloClient, InMemoryCache } from '@apollo/client';

// THIS IS THE CRUCIAL DEEP IMPORT MENTIONED IN THE DOCUMENTATION
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";

// The createUploadLink function from this specific file path
// is what sets up the multipart request correctly.
const uploadLink = createUploadLink({
  uri: 'http://127.0.0.1:8000/graphql/',
  // headers: {
  //   "Apollo-Require-Preflight": "true",
  // },
});

// Create the Apollo Client instance
const client = new ApolloClient({
  link: uploadLink, // Use the upload link
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

export default client;