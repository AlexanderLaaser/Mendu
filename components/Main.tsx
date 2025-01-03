import React, { ReactNode } from "react";
import "./globals.css";

export default function Main(props: { children: ReactNode }) {
  const { children } = props;
  return <main className="flex-1 flex flex-col">{children}</main>;
}
