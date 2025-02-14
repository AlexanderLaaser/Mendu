import { Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import AuthGuardLayout from "@/components/AuthGuardLayout";
import { UserDataProvider } from "@/context/UserDataContext";
import { ChatsProvider } from "@/context/ChatsContext";
import { MatchProvider } from "@/context/MatchContext";
import { Analytics } from "@vercel/analytics/react";
import { OfferProvider } from "@/context/OfferContext";
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
        <AuthProvider>
          <UserDataProvider>
            <MatchProvider>
              <ChatsProvider>
                <OfferProvider>
                  <AuthGuardLayout>
                    <Analytics mode="production" />
                    {children}
                  </AuthGuardLayout>
                </OfferProvider>
              </ChatsProvider>
            </MatchProvider>
          </UserDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
