import { Montserrat } from "next/font/google";
import "../globals.css";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata = {
  title: "Recommend - Login",
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
