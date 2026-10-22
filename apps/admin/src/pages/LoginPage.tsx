import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@flyora/validators";
import type { AuthSession } from "@flyora/types";
import { apiClient } from "../lib/apiClient";
import { useAuthStore } from "../stores/authStore";
import {
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
  Compass,
} from "lucide-react";

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema as any),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await apiClient.post<AuthSession>("/auth/login", data);
      setAuth(result);

      const from = (location.state as any)?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          "Invalid credentials. Please verify your email and password.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFillAdmin = () => {
    setValue("email", "admin@flyora.com");
    setValue("password", "FlyoraAdmin@2026");
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-zinc-900 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-sm w-full space-y-6">
        {/* Brand Header */}
        <div className="text-left space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
              <Compass className="w-4 h-4 stroke-[1.5]" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-zinc-900">
              Flyora
            </span>
          </div>
          <div>
            <h1 className="text-xl font-medium tracking-tight text-zinc-900">
              Staff Portal
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Enter your credentials to access operations.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-zinc-200/90 rounded-xl p-6 sm:p-7 shadow-sm">
          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed text-zinc-700">
                {errorMessage}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-600">
                Email
              </label>
              <input
                type="email"
                {...register("email")}
                placeholder="name@flyora.com"
                autoComplete="email"
                className={`w-full px-3 py-2 bg-[#FBFBFA] border rounded-lg text-xs text-zinc-900 placeholder-zinc-400 transition focus:outline-none focus:border-black focus:bg-white ${
                  errors.email ? "border-zinc-500" : "border-zinc-200"
                }`}
              />
              {errors.email && (
                <p className="text-[11px] text-zinc-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-600">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className={`w-full pl-3 pr-9 py-2 bg-[#FBFBFA] border rounded-lg text-xs text-zinc-900 placeholder-zinc-400 transition focus:outline-none focus:border-black focus:bg-white ${
                    errors.password ? "border-zinc-500" : "border-zinc-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-400 hover:text-zinc-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-zinc-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-2.5 px-4 bg-black text-white hover:bg-zinc-800 font-medium text-xs rounded-lg transition disabled:opacity-40 flex items-center justify-center gap-2 shadow-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-5 pt-4 border-t border-zinc-100 text-center">
            <button
              type="button"
              onClick={handleQuickFillAdmin}
              className="text-[11px] text-zinc-500 hover:text-black transition"
            >
              Fill demo credentials (admin@flyora.com)
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-zinc-400">
          Flyora Travels • Staff Operations
        </p>
      </div>
    </div>
  );
};
