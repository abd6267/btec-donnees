"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RequireRole({
  allowed,
  children,
}: {
  allowed: string[];
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("btec_role");
    if (!role) {
      router.push("/");
      return;
    }
    if (!allowed.includes(role)) {
      router.push("/dashboard");
      return;
    }
    setReady(true);
  }, [router, allowed]);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}