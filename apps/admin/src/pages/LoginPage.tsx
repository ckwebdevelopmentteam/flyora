import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@flyora/validators";
import { loginDestination } from "../routes/GuestRoute";
import { login } from "../lib/apiClient";
import { userMessage } from "../lib/userMessage";
import { FormError } from "../components/ui/Modal";
import { Eye, EyeOff, Loader2, ArrowRight, Compass } from "lucide-react";

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema as any),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    if (isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await login(data);

      const from = loginDestination(location.state);
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(
        err?.statusCode === 401
          ? "Check your email and password, then try again."
          : userMessage(err, "We couldn't sign you in. Please try again."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <span className="brand-mark">
            <Compass size={20} />
          </span>
          Flyora
        </div>
        <h1>Welcome back</h1>
        <p className="subtitle">Sign in to your staff workspace.</p>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {errorMessage && <FormError>{errorMessage}</FormError>}
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="you@flyora.com"
              {...register("email")}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-xs text-rose-700">
                Enter a valid email address.
              </p>
            )}
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                {...register("password")}
                className="pr-12"
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
              />
              <button
                type="button"
                className="icon-button absolute right-1 top-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-xs text-rose-700">
                Enter your password.
              </p>
            )}
          </div>
          <button className="button-primary" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                Sign in <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
        <p className="login-footnote">
          Need access or help with your password?
          <br />
          Contact your Flyora manager.
        </p>
      </div>
      <p className="text-xs text-slate-400 mt-16">
        Flyora Travels · Staff workspace
      </p>
    </main>
  );
};
