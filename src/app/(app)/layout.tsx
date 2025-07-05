import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MysteryBox - Anonymous Messaging Platform",
  description: "Send and receive anonymous feedback messages safely and securely.",
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
    </>
  );
}
