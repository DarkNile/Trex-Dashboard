import { gql } from "@apollo/client";
import { getCookie, setCookie } from "cookies-next";

const REFRESH_TOKEN = gql`
  query RefreshToken {
    refreshToken
  }
`;

export const refreshTokenAndRetry = async () => {
  try {
    const response = await fetch("https://www.dev.trex-logistic.com/graphQL", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include', // Important: This enables sending and receiving cookies
      body: JSON.stringify({
        query: REFRESH_TOKEN.loc?.source.body,
      }),
    });

    // The refresh token is handled automatically via httpOnly cookies
    const result = await response.json();

    if (result.data?.refreshToken) {
      // Update the access token
      setCookie("token", result.data.refreshToken);
      localStorage.setItem("token", result.data.refreshToken);
      return result.data.refreshToken;
    }

    throw new Error("Failed to refresh token");
  } catch (error) {
    console.error("Token refresh failed:", error);
    // Clear tokens on failure
    setCookie("token", "");
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw error;
  }
};