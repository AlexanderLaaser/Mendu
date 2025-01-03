import { Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import AuthGuardLayout from "@/components/AuthGuardLayout";
import { UserDataProvider } from "@/context/UserDataProvider";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata = {
  title: "Mendu",
  description: "The modern way of connecting to companies!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`w-full mx-auto text-sm sm:text-base ${montserrat.className}`}
      >
        {/* 
          Wir umhüllen ALLES mit AuthProvider,
          aber das eigentliche Layout-Rendering passiert
          in unserer Client-Komponente AuthenticatedLayout.
        */}
        <AuthProvider>
          <UserDataProvider>
            <AuthGuardLayout>{children}</AuthGuardLayout>
          </UserDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
