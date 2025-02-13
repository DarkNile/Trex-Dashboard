"use client";

import { useForm } from "react-hook-form";
import { gql } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useGenericMutation } from "@/hooks/generic/useGenericMutation";

const SEND_RESET_PASSWORD = gql`
  mutation SendResetPassword($email: String!) {
    sendResetPassword(email: $email)
  }
`;

interface ResetPasswordForm {
  email: string;
}

export default function RequestResetPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    defaultValues: {
      email: "",
    },
  });

  const {
    execute: sendResetPassword,
    error: serverError,
    isSuccess: isEmailSent,
    isLoading,
  } = useGenericMutation<{ sendResetPassword: boolean }, { email: string }>({
    mutation: SEND_RESET_PASSWORD,
    onSuccess: (data) => {
      if (!data.sendResetPassword) {
        throw new Error("Failed to send reset code");
      }
    },
    defaultErrorMessage: "Failed to send reset code",
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    await sendResetPassword({
      email: data.email,
    });
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg px-8 pt-8 text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Check Your Email
          </h2>
          <p className="text-gray-600 mb-4">
            We&apos;ve sent a reset code to your email address. Please check
            your inbox and use the code to reset your password.
          </p>
          <button
            onClick={() => router.push("/resetpassword")}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Proceed to Reset Password
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg px-8 pt-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-gray-500 mt-2">
            Enter your email to receive a reset code
          </p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
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

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Sending..." : "Send Reset Code"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/login")}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
