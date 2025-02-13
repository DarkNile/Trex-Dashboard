// apollo-client.ts
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  NormalizedCacheObject,
  Operation
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { getCookie, setCookie } from "cookies-next";
import { gql } from '@apollo/client';

// Define types
interface RefreshTokenResponse {
  data?: {
    refreshToken: string;
  };
  errors?: Array<{ message: string }>;
}

// Define the refresh token query
const REFRESH_TOKEN = gql`
  query RefreshToken {
    refreshToken
  }
`;

const httpLink = createHttpLink({
  uri: "https://www.dev.trex-logistic.com/graphQL",
});

// Create auth link for adding token to headers
const authLink = setContext((_, { headers }) => {
  const token = getCookie("token");
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Create error handling link for token refresh
const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      // Check if error is due to invalid/expired token
      if (err.message.includes('Unauthorized') || err.message.includes('invalid token')) {
        (async () => {
          try {
            const currentToken = getCookie("token") as string;

            // Call refresh token query
            const response = await fetch("https://www.dev.trex-logistic.com/graphQL", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${currentToken}`,
              },
              body: JSON.stringify({
                query: REFRESH_TOKEN.loc?.source.body,
              }),
            });

            const result = await response.json() as RefreshTokenResponse;

            if (result.data?.refreshToken) {
              // Store new token
              setCookie("token", result.data.refreshToken);

              // Update localStorage to maintain consistency with login hook
              localStorage.setItem("token", result.data.refreshToken);

              // Modify the operation context with new token
              const oldHeaders = operation.getContext().headers;
              operation.setContext({
                headers: {
                  ...oldHeaders,
                  Authorization: `Bearer ${result.data.refreshToken}`,
                },
              });

              // Retry the failed request
              forward(operation);
            } else {
              throw new Error("Token refresh failed");
            }
          } catch (error) {
            // Handle refresh token failure
            console.error("Token refresh failed:", error);
            setCookie("token", "");
            localStorage.removeItem("token");

            // Use window.location for client-side navigation to avoid router issues
            window.location.href = "/login";
          }
        })();
      }
    }
  }
});

// Create and export the Apollo Client instance
export const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});