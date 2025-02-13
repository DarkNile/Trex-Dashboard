"use client";
import { useQuery, DocumentNode, OperationVariables } from "@apollo/client";
import { useState, useEffect } from "react";
import { getCookie } from "cookies-next";
import { refreshTokenAndRetry } from "../(auth)/refreshToken";

interface QueryConfig<TData, TVariables> {
  query: DocumentNode;
  variables?: TVariables;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  defaultErrorMessage?: string;
  options?: {
    skip?: boolean;
    pollInterval?: number;
    fetchPolicy?:
    | "cache-first"
    | "network-only"
    | "cache-and-network"
    | "no-cache";
    context?: Record<string, any>;
  };
}

export const useGenericQuery = <
  TData = any,
  TVariables extends OperationVariables = OperationVariables
>({
  query,
  variables,
  onSuccess,
  onError,
  defaultErrorMessage = "An error occurred while fetching data",
  options = {},
}: QueryConfig<TData, TVariables>) => {
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get the token for each query
  const token = getCookie("token");
  const headers = {
    ...(options.context?.headers || {}),
    Authorization: token ? `Bearer ${token}` : "",
  };

  const context = {
    ...options.context,
    headers: {
      ...options.context?.headers,
      authorization: `Bearer ${token}`,
    },
  };

  const handleError = async (error: Error) => {
    if (
      (error.message.includes("jwt expired") ||
        error.message.includes("invalid token") ||
        error.message.includes("Unauthorized")) &&
      !isRefreshing
    ) {
      setIsRefreshing(true);
      try {
        await refreshTokenAndRetry();
        const result = await refetch(variables);
        if (result.data) {
          setError(null);
          setIsSuccess(true);
          onSuccess?.(result.data as TData);
        }
      } catch (refreshError) {
        const errorMessage = (refreshError as Error).message || defaultErrorMessage;
        setError(errorMessage);
        onError?.(refreshError as Error);
      } finally {
        setIsRefreshing(false);
      }
    } else {
      const errorMessage = error.message || defaultErrorMessage;
      setError(errorMessage);
      onError?.(error);
    }
  };

  const { data, loading, refetch, fetchMore, networkStatus, client } = useQuery<
    TData,
    TVariables
  >(query, {
    variables,
    context,
    notifyOnNetworkStatusChange: true,
    onError: handleError,
    onCompleted: (data) => {
      setError(null);
      setIsSuccess(true);
      onSuccess?.(data as TData);
    },
  });

  useEffect(() => {
    if (loading) {
      setError(null);
      setIsSuccess(false);
    }
  }, [loading]);

  const refetchWithAuth = async (refetchVariables?: Partial<TVariables>) => {
    try {
      return await refetch(refetchVariables);
    } catch (error) {
      await handleError(error as Error);
      return { data: null, error };
    }
  };

  return {
    data,
    loading: loading || isRefreshing,
    error,
    isSuccess,
    refetch: refetchWithAuth,
    fetchMore,
    networkStatus,
    client,
    reset: () => {
      setError(null);
      setIsSuccess(false);
    },
  };
};