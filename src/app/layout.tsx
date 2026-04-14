import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppLayout } from "@/components/layout";
import { AuthProvider } from "@/components/auth/provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KioskoFlow - Sistema de Gestión",
  description: "Sistema de gestión para kioscos y afines",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className={inter.className}>
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}