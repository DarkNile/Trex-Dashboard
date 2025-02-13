// app/hooks/useLogin.ts
import { useState } from "react";
import { useForm } from "react-hook-form";
import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getCookie, deleteCookie } from "cookies-next";

// Define types for the form
type LoginFormInputs = {
  email: string;
  password: string;
};

// GraphQL mutation
const AUTHENTICATE = gql`
  mutation Authenticate($email: String!, $password: String!) {
    authenticate(authenticate: { email: $email, password: $password })
  }
`;

export function useLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>();

  const [authenticate] = useMutation(AUTHENTICATE, {
    onCompleted: (data) => {
      // Store the token
      localStorage.setItem("token", data.authenticate);
      console.log("Token stored:", data.authenticate);
      document.cookie = `token=${data.authenticate}; path=/`;
      // Configure axios default headers for future requests
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${data.authenticate}`;

      // Redirect to dashboard
      const redirectTo = (getCookie("redirectTo") as string) || "/";
      deleteCookie("redirectTo");
      router.push(redirectTo);
    },
    onError: (error) => {
      setServerError(error.message || "An error occurred during login");
    },
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setServerError("");
    try {
      await authenticate({
        variables: {
          email: data.email,
          password: data.password,
        },
      });
    } catch (err) {
      // Error is handled by onError callback
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    showPassword,
    setShowPassword,
    serverError,
    onSubmit,
  };
}
