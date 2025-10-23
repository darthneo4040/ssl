import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "../components/ui/sonner"

export const metadata: Metadata = {
  title: "SSL-Vzla | Gestión de Seguridad Laboral",
  description: "Plataforma integral para la gestión de SSL en Venezuela",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}