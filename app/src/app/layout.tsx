import { PropsWithChildren } from "react";
import { Inter } from "next/font/google";

import { Footer } from "~/components/Footer";
import { Navigation } from "~/components/Navigation";
import { TooltipProvider } from "~/components/Tooltip";
import { ToastManager } from "~/components/ToastManager";
import { TailwindIndicator } from "~/components/TailwindIndicator";
import { ReactQueryProvider } from "~/components/ReactQueryProvider";
import { NavigationLoadingBar } from "~/components/NavigationLoadingBar";

import { MAINTENANCE_MODE, ANNOUNCEMENT_BANNER } from "../../config";

import "../globals.css";
import { TopBanner } from "~/components/TopBanner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    template: "%s | Wise Old Man",
    default: "Wise Old Man",
  },
  description: "The Open Source Old School Runescape player progress tracker.",
};

function RootLayout(props: PropsWithChildren) {
  const { children } = props;

  console.log(process.env);

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
