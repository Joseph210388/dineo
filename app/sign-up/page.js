"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthForms from "../../components/auth-modal/auth-forms";
import { safeRedirectPath } from "../../backend/safe-redirect";

function SignUpPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState("sign-up");
  const redirectPath = safeRedirectPath(searchParams.get("redirect"));
  const reason = searchParams.get("reason") || "";

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-lg sm:p-8">
      <AuthForms
        mode={mode}
        onModeChange={setMode}
        reason={reason}
        onSuccess={() => {
          router.push(redirectPath);
          router.refresh();
        }}
      />
    </div>
  );
}

export default function SignUpPage() {
  return (
    <main className="flex min-h-[calc(100svh-8rem)] items-center justify-center bg-cream px-4 py-10 sm:py-16">
      <Suspense fallback={<p className="text-stone-500">Cargando...</p>}>
        <SignUpPageContent />
      </Suspense>
    </main>
  );
}
