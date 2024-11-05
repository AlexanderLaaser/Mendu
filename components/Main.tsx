import React, { ReactNode } from "react";

export default function Main(props: { children: ReactNode }) {
  const { children } = props;
  return <main className="flex-1 flex flex-col">{children}</main>;
}
