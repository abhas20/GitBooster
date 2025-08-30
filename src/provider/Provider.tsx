"use client";
import { SessionProvider } from "next-auth/react";

export default function Provider({ children }: { children: React.ReactNode }) {
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL!;

  return (
    <SessionProvider refetchInterval={10 * 60}>
        {children}
    </SessionProvider>
  );
}
