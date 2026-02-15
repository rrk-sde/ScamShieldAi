import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScamShield AI — Digital Fraud Detection & Response Platform",
  description: "AI-powered platform to detect digital arrest scams, cyber fraud, phishing, and online threats. Analyze suspicious messages instantly with advanced AI pattern detection.",
  keywords: "scam detection, digital arrest, cyber fraud, phishing, AI analysis, cyber crime, FIR generator",
  openGraph: {
    title: "ScamShield AI — Digital Fraud Detection",
    description: "Protect yourself from digital scams with AI-powered analysis",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
