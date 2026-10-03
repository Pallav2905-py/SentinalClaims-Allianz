import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "SentinelClaims — AI Fraud Detection Console",
  description: "Advanced AI-powered insurance claims processing, fraud detection, and investigator evidence graph platform",
  keywords: "insurance, fraud detection, claims, AI agents, digital twin",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
        style={{ background: '#0a0d14', minHeight: '100vh' }}
      >
        {children}
      </body>
    </html>
  );
}

