import { Inter, Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import PageTransition from "@/components/ui/PageTransition";
import CourtroomBackground from "@/components/ui/CourtroomBackground";
import { BackgroundProvider } from "@/contexts/BackgroundContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({ 
  subsets: ["latin"], 
  weight: ["400", "600", "900"],
  variable: "--font-fraunces" 
});
const ibmPlexMono = IBM_Plex_Mono({ 
  subsets: ["latin"], 
  weight: ["400"],
  variable: "--font-ibm-plex-mono" 
});

export const metadata = {
  title: "NyaySahayak",
  description: "Next-gen court case management system",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${ibmPlexMono.variable}`}>
      <body className="bg-transparent text-ink antialiased isolate">
        <BackgroundProvider>
          <CourtroomBackground />
          <PageTransition />
          {children}
        </BackgroundProvider>
      </body>
    </html>
  );
}
