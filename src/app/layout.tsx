import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/provider/theme-provider";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import Provider from "@/provider/Provider";
import BackgroundParticles from "@/components/ui/background-particle";

export const metadata: Metadata = {
  title: "Git Booster",
  description: "Track your GitHub stats with ease",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <Provider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange>
            <div className="absolute inset-0 z-0">
              <BackgroundParticles />
            </div>
            <header className="relative z-10">
              <Header />
            </header>
            <Toaster />
            <main className="relative z-10">{children}</main>
          </ThemeProvider>
        </Provider>
      </body>
    </html>
  );
}
