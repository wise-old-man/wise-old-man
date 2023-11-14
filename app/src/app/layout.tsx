import { PropsWithChildren } from "react";
import { Inter } from "next/font/google";
import { cn } from "~/utils/styling";
import { Footer } from "~/components/Footer";
import { Navigation } from "~/components/Navigation";
import { TooltipProvider } from "~/components/Tooltip";
import { ToastManager } from "~/components/ToastManager";
import { TailwindIndicator } from "~/components/TailwindIndicator";
import { ReactQueryProvider } from "~/components/ReactQueryProvider";
import { NavigationLoadingBar } from "~/components/NavigationLoadingBar";
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

  return (
    <html lang="en" className={inter.variable}>
      <body>
        <NavigationLoadingBar />
        <TopBanner
          body={
            <>
              {`⚠️ There's currently a issue with the Jagex hiscores due to a recently reverted banwave that is causing some players to get flagged or archived. If you're affected, try to log out in-game (to update your hiscores) and then update your profile.`}
            </>
          }
        />
        <TooltipProvider delayDuration={300}>
          <ReactQueryProvider>
            <Navigation>
              {children}
              <Footer />
            </Navigation>
          </ReactQueryProvider>
        </TooltipProvider>
        <TailwindIndicator />
        <ToastManager />
      </body>
    </html>
  );
}

export default RootLayout;
