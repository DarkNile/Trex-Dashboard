import { useMutation, OperationVariables } from "@apollo/client";
import { DocumentNode } from "graphql";
import { useState } from "react";
import { refreshTokenAndRetry } from "../(auth)/refreshToken";

interface MutationConfig<TData, TVariables> {
  mutation: DocumentNode;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  defaultErrorMessage?: string;
}

export const useGenericMutation = <
  TData,
  TVariables extends OperationVariables
>({
  mutation,
  onSuccess,
  onError,
  defaultErrorMessage = "An error occurred",
}: MutationConfig<TData, TVariables>) => {
  const [error, setError] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentVariables, setCurrentVariables] = useState<TVariables | null>(null);

  const handleError = async (error: Error) => {
    if (
      (error.message.includes("jwt expired") ||
        error.message.includes("invalid token") ||
        error.message.includes("Unauthorized")) &&
      !isRefreshing &&
      currentVariables
    ) {
      setIsRefreshing(true);
      try {
        await refreshTokenAndRetry();
        const result = await mutate({ variables: currentVariables });
        if (result.data) {
          setError("");
          setIsSuccess(true);
          onSuccess?.(result.data as TData);
          return result;
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
    return null;
  };

  const [mutate, mutationResult] = useMutation(mutation, {
    onCompleted: (data: TData) => {
      setIsSuccess(true);
      onSuccess?.(data);
    },
    onError: handleError,
  });

  const execute = async (variables: TVariables) => {
    setError("");
    setIsSuccess(false);
    setCurrentVariables(variables);
    try {
      const result = await mutate({ variables });
      return result;
    } catch (err) {
      return null;
    }
  };

  return {
    execute,
    error,
    isSuccess,
    isLoading: mutationResult.loading || isRefreshing,
    reset: () => {
      setError("");
      setIsSuccess(false);
      setCurrentVariables(null);
    },
  };
};