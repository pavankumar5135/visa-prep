import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started | B1 Visa Interview AI Coach",
  description: "Complete your profile setup to personalize your B1 visa interview preparation experience.",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 