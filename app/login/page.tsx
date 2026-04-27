import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-app-bg px-4">
      <div className="w-full max-w-md bg-white border border-[#E8E8E6] rounded-2xl p-8">
        <div className="mb-6">
          <div className="text-[18px] font-semibold tracking-tight">PM</div>
          <p className="mt-2 text-sm text-app-muted">
            Sign in with your work email. A magic link will be sent.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
