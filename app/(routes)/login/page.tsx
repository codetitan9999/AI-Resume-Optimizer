import { LoginForm } from "@/components/auth/login-form";
import { redirectIfAuthenticated } from "@/lib/server/auth/guards";

export default async function LoginPage() {
  await redirectIfAuthenticated("/analyze");

  return (
    <section className="py-10 md:py-14">
      <LoginForm />
    </section>
  );
}
