import { Analytics } from "@vercel/analytics/react";
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
import { Button } from "~/components/Button";
import "../globals.css";

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
    <html lang="en" className={cn(inter.variable, "h-full")}>
      <body className="h-full bg-gray-900 text-white">
        <div className="flex items-center justify-between gap-x-4 bg-blue-600 p-3">
          <span className="text-sm">
            This a beta version of the website is still under construction. We&apos;d appreciate your
            ideas, bug reports and feedback!
          </span>
          <a href="https://discord.gg/QbGaWrDc" target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="bg-white text-blue-600 hover:bg-blue-50">
              Share feedback
            </Button>
          </a>
        </div>
        <NavigationLoadingBar />
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
        <Analytics />
      </body>
    </html>
  );
}

export default RootLayout;
