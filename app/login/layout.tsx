import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In | B1 Visa Interview AI Coach",
  description: "Log in to your B1 Visa Interview AI Coach account to continue practicing for your visa interview.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 