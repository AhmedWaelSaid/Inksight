
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Providers from './../components/Providers';
import "react-loading-skeleton/dist/skeleton.css"
import { Toaster } from "@/components/ui/sonner";
import 'simplebar-react/dist/simplebar.min.css'
import { constructMetadata } from './../lib/utils';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" data-theme="dark"  >
      <Providers>
      <body
        className={cn("min-h-screen font-sans grainy antialiased " , `${geistSans.variable} ${geistMono.variable} `)}
      >
        <Toaster />
        <Navbar/>
        {children}
      </body>
      </Providers>
    </html>
  );
}
