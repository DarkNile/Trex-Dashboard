"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { gql } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";

const RESET_PASSWORD = gql`
  mutation ResetPassword($password: String!, $code: Int!, $email: String!) {
    resetPassword(password: $password, code: $code, email: $email)
  }
`;

interface ResetPasswordForm {
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
}

interface ResetPasswordVars {
  email: string;
  code: number;
  password: string;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMatchError, setPasswordMatchError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordForm>({
    defaultValues: {
      email: "",
      code: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    execute: resetPassword,
    error: serverError,
    isLoading,
  } = useGenericMutation<{ resetPassword: boolean }, ResetPasswordVars>({
    mutation: RESET_PASSWORD,
    onSuccess: () => {
      router.push("/login?reset=success");
    },
    defaultErrorMessage: "Failed to reset password",
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    setPasswordMatchError("");

    if (data.password !== data.confirmPassword) {
      setPasswordMatchError("Passwords do not match");
      return;
    }

    await resetPassword({
      email: data.email,
      code: parseInt(data.code),
      password: data.password,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg px-8 pt-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Reset Your Password</h1>
          <p className="text-gray-500 mt-2">Enter the code from your email</p>
        </div>

        {(serverError || passwordMatchError) && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {serverError || passwordMatchError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              type="email"
              placeholder="Enter your email"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reset Code
            </label>
            <input
              {...register("code", {
                required: "Reset code is required",
                pattern: {
                  value: /^\d+$/,
                  message: "Code must be numeric",
                },
              })}
              type="text"
              placeholder="Enter reset code"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.code ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                  pattern: {
                    value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&.]{8,}$/,
                    message:
                      "Password must contain at least one letter and one number",
                  },
                })}
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === watch("password") || "Passwords do not match",
              })}
              type={showPassword ? "text" : "password"}
              placeholder="Confirm new password"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
