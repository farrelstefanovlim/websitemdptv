import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "MDPTV | Redefine Broadcasting",
    description: "Interactive Open Recruitment 2025/2026",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} bg-black text-white overflow-x-hidden antialiased`}>
                <SmoothScrollProvider>
                    {children}
                </SmoothScrollProvider>
            </body>
        </html>
    );
}
