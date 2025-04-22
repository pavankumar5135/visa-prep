import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | B1 Visa Interview AI Coach",
  description: "Create your account to start practicing for your B1 visa interview with our AI-powered coach.",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 