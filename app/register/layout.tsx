import { Montserrat } from "next/font/google";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata = {
  title: "Recommend - Register",
  description: "The modern way of getting into companies!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={
        "w-full mx-auto text-sm sm:text-base min-h-screen flex flex-col " +
        montserrat.className
      }
    >
      {children}
    </div>
  );
}
