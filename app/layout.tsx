import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import { EdgeStoreProvider } from "@/lib/edgestore";
import { cn } from "@/lib/utils";
import localFont from "next/font/local";
import React from "react";
import { LogoutModalProvider } from "@/context/logout-modal-context";
import { CSPostHogProvider } from "@/app/posthog";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Melanin Kapital | Neo-Bank",
  description:
    "Gain access to a curated selection of funding opportunities perfectly suited to your business requirements.",
};

const montreal = localFont({
  src: [
    {
      path: "./fonts/NeueMontreal-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/NeueMontreal-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/NeueMontreal-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/NeueMontreal-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/NeueMontreal-Italic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/NeueMontreal-MediumItalic.otf",
      weight: "500",
      style: "italic",
    },
    {
      path: "./fonts/NeueMontreal-BoldItalic.otf",
      weight: "700",
      style: "italic",
    },
    {
      path: "./fonts/NeueMontreal-LightItalic.otf",
      weight: "300",
      style: "italic",
    },
  ],
  variable: "--font-montreal",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <Script id="hotjar" strategy="beforeInteractive">
            {`
            (function (c, s, q, u, a, r, e) {
                c.hj=c.hj||function(){(c.hj.q=c.hj.q||[]).push(arguments)};
                c._hjSettings = { hjid: a };
                r = s.getElementsByTagName('head')[0];
                e = s.createElement('script');
                e.async = true;
                e.src = q + c._hjSettings.hjid + u;
                r.appendChild(e);
            })(window, document, 'https://static.hj.contentsquare.net/c/csq-', '.js', 5294338);
          `}
          </Script>
        </head>
        <CSPostHogProvider>
          <body
            className={cn(
              "min-h-screen bg-background font-sans antialiased",
              montreal.className,
            )}
          >
            <EdgeStoreProvider>
              <Providers>
                <LogoutModalProvider>
                  {children}
                  <Toaster richColors position={"top-right"} />
                </LogoutModalProvider>
              </Providers>
            </EdgeStoreProvider>
          </body>
        </CSPostHogProvider>
      </html>
    </ClerkProvider>
  );
}
