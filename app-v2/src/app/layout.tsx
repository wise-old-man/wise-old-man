import { Analytics } from "@vercel/analytics/react";
import { PropsWithChildren } from "react";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { cn } from "~/utils/styling";
import { Footer } from "~/components/Footer";
import { Navigation } from "~/components/Navigation";
import { TooltipProvider } from "~/components/Tooltip";
import { ToastManager } from "~/components/ToastManager";
import { TailwindIndicator } from "~/components/TailwindIndicator";
import { ReactQueryProvider } from "~/components/ReactQueryProvider";
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
        {process.env.NODE_ENV !== "development" && (
          <div className="fixed left-0 right-0 top-0 z-[100] bg-red-900 p-3 text-center xl:hidden">
            This website is under construction and is not yet optimized for mobile browsing.
          </div>
        )}
        <NextTopLoader color="#3b82f6" showSpinner={false} />
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
