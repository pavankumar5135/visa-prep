import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import { AppLoading } from "./components/ui/AppLoading";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "B1 Visa Interview AI Coach | Practice and Prepare for Your Interview",
  description: "Prepare for your B1 visa interview with our AI-powered mock interview tool. Practice with realistic scenarios, get personalized feedback, and improve your chances of approval.",
  keywords: "B1 visa, interview preparation, visa interview, business visa, visa coach, AI interview practice",
  authors: [{ name: "B1 Visa Prep" }],
  creator: "B1 Visa Prep",
  openGraph: {
    title: "B1 Visa Interview AI Coach | Practice and Prepare for Your Interview",
    description: "Prepare for your B1 visa interview with our AI-powered mock interview tool. Get personalized feedback and improve your chances of approval.",
    url: "https://b1visaprep.com",
    siteName: "B1 Visa Prep",
    images: [
      {
        url: "/visa-interview.png",
        width: 1200,
        height: 630,
        alt: "B1 Visa Interview Preparation",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "B1 Visa Interview AI Coach",
    description: "AI-powered mock interviews to prepare for your B1 visa application",
    images: ["/visa-interview.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <AppLoading />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
