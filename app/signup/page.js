import AuthSplitLayout from "@/components/AuthSplitLayout";
import SignupForm from "@/components/SignupForm";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function SignupPage() {
  if (!isSupabaseConfigured()) {
    return (
      <AuthSplitLayout>
        <span className="section-tag">( account )</span>
        <h2>Accounts are coming soon</h2>
        <p className="section-sub">
          Sign-ups aren't set up yet — check back soon, or reach out via
          the contact page.
        </p>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout>
      <span className="section-tag">( account )</span>
      <h2>Create an account</h2>
      <p className="section-sub" style={{ marginBottom: 24 }}>
        AEOrank helps your brand show up in AI answers, backed by
        measurable Reddit signals.
      </p>
      <SignupForm />
    </AuthSplitLayout>
  );
}
