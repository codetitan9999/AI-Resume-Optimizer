import { SignupForm } from "@/components/auth/signup-form";
import { redirectIfAuthenticated } from "@/lib/server/auth/guards";

export default async function SignupPage() {
  await redirectIfAuthenticated("/analyze");

  return (
    <section className="py-10 md:py-14">
      <SignupForm />
    </section>
  );
}
