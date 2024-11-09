import { Montserrat } from "next/font/google";
import "./globals.css";
import Header from "@/components/main/Header";
import Footer from "@/components/main/Footer";
import { AuthProvider } from "../context/authContext";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata = {
  title: "Recommend",
  description: "The modern way of getting into companies!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>{/* Add any meta tags, fonts, etc., here */}</head>
      <AuthProvider>
        <body
          className={
            "w-full mx-auto text-sm sm:text-base min-h-screen flex flex-col " +
            montserrat.className
          }
        >
          <Header></Header>
          {children}
          <Footer></Footer>
        </body>
      </AuthProvider>
    </html>
  );
}
