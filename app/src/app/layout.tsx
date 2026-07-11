import { PropsWithChildren } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Footer } from "~/components/Footer";
import { Navigation } from "~/components/Navigation";
import { TooltipProvider } from "~/components/Tooltip";
import { ToastManager } from "~/components/ToastManager";
import { TailwindIndicator } from "~/components/TailwindIndicator";
import { ReactQueryProvider } from "~/components/ReactQueryProvider";
import { NavigationLoadingBar } from "~/components/NavigationLoadingBar";
import { TopBanner } from "~/components/TopBanner";

import { MAINTENANCE_MODE, ANNOUNCEMENT_BANNER } from "../../config";

import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://wiseoldman.net"),
  title: {
    template: "%s | Wise Old Man",
    default: "Wise Old Man — OSRS Progress Tracker",
  },
  description:
    "Track your Old School RuneScape progress: XP gains, achievements, clan affiliations and competitions. Open source and free.",
  openGraph: {
    type: "website",
    siteName: "Wise Old Man",
    url: "https://wiseoldman.net",
  },
  alternates: { canonical: "./" },
};

function RootLayout(props: PropsWithChildren) {
  const { children } = props;

  return (
    <html lang="en" className={inter.variable}>
      <body>
        <NavigationLoadingBar />

        {ANNOUNCEMENT_BANNER.enabled && ANNOUNCEMENT_BANNER.message && (
          <TopBanner
            body={<>{ANNOUNCEMENT_BANNER.message}</>}
            color={ANNOUNCEMENT_BANNER.color as any}
          />
        )}

        <TooltipProvider delayDuration={300}>
          <ReactQueryProvider>
            {MAINTENANCE_MODE.enabled ? (
              <>{children}</>
            ) : (
              <>
                <Navigation>
                  {children}
                  <Footer />
                </Navigation>
              </>
            )}
          </ReactQueryProvider>
        </TooltipProvider>
        <TailwindIndicator />
        <ToastManager />
      </body>
    </html>
  );
}

export default RootLayout;
